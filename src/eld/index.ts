/*
Ported from efficient-language-detector-no-dynamic-import (nitotm/efficient-language-detector-js).
Copyright 2023 Nito T.M.
License https://www.apache.org/licenses/LICENSE-2.0 Apache-2.0
Author Nito T.M. (https://github.com/nitotm)
Package npmjs.com/package/eld
See src/eld/README.md for what was ported, what was dropped, and why this exists.
*/

import { dictionary } from './dictionary';
import { ngramsData } from './ngrams-m60';
import { separators } from './regex-patterns';

// Built once at module load from the generated M60 dataset (see languageData.js in upstream's
// setNgrams()). No lazy/dynamic loading — this app always uses the M60 dataset.
const langCodes = ngramsData.languages;
const langScoreTemplate: number[] = Array(Object.keys(langCodes).length).fill(
  0,
);
const ngrams = ngramsData.ngrams;

/**
 * detect() identifies the natural language of a UTF-8 string.
 * Returns an object with an ISO 639-1 code, or an empty string if undetermined.
 *
 * @param text UTF-8 input
 */
function detect(text: string): { language: string } {
  if (typeof text !== 'string') return { language: '' };

  const byteWords = textProcessor(text);
  const byteNgrams = getByteNgrams(byteWords);
  const numNgrams = Object.keys(byteNgrams).length;
  const results = calculateScores(byteNgrams, numNgrams);

  let language = '';
  if (results.length > 0) {
    results.sort((a, b) => b[1] - a[1]);
    language = langCodes[results[0][0]];
  }
  return { language };
}

function textProcessor(text: string): string[] {
  let processed = text.substring(0, 1000);
  // Normalize special characters/word separators
  processed = processed.replace(separators, ' ');
  processed = processed.trim().toLowerCase();
  return strToUtf8Bytes(processed); // returns array of words
}

/**
 * Gets Ngrams from a given array of words
 */
function getByteNgrams(words: string[]): Record<string, number> {
  const byteNgrams: Record<string, number> = {};
  let countNgrams = 0;
  let thisBytes: string;
  let j: number;

  for (const key in words) {
    const word = words[key];
    let len = word.length;
    if (len > 70) {
      len = 70;
    }

    for (j = 0; j + 4 < len; j += 3, ++countNgrams) {
      thisBytes = (j === 0 ? ' ' : '') + word.substring(j, j + 4);
      byteNgrams[thisBytes] =
        typeof byteNgrams[thisBytes] !== 'undefined'
          ? byteNgrams[thisBytes] + 1
          : 1;
    }
    thisBytes = `${j === 0 ? ' ' : ''}${word.substring(len !== 3 ? len - 4 : 0)} `;
    byteNgrams[thisBytes] =
      typeof byteNgrams[thisBytes] !== 'undefined'
        ? byteNgrams[thisBytes] + 1
        : 1;
    countNgrams++;
  }
  // Frequency is multiplied by 15000 at the ngrams database. A reduced number (13200) seems to work better.
  // Linear formulas were tried, decreasing the multiplier for fewer ngram strings, no meaningful improvement.
  for (const bytes in byteNgrams) {
    byteNgrams[bytes] = (byteNgrams[bytes] / countNgrams) * 13200;
  }
  return byteNgrams;
}

/**
 * Calculate scores for each language from the given Ngrams
 */
function calculateScores(
  byteNgrams: Record<string, number>,
  numNgrams: number,
): [number, number][] {
  let langCount: number;
  let relevancy: number;
  let globalFrequency: number;
  let frequency: number;
  let thisByte: Record<string, number>;
  const langScore = [...langScoreTemplate];

  for (const bytes in byteNgrams) {
    frequency = byteNgrams[bytes];
    thisByte = ngrams[bytes];

    if (thisByte) {
      langCount = Object.keys(thisByte).length;
      // Ngram score multiplier, the fewer languages found the more relevancy. Formula can be fine-tuned.
      if (langCount === 1) {
        relevancy = 27; // Handpicked relevance multiplier, trial-error
      } else if (langCount < 16) {
        relevancy = (16 - langCount) / 2 + 1;
      } else {
        relevancy = 1;
      }
      // Most time-consuming loop, do only the strictly necessary inside
      for (const lang in thisByte) {
        globalFrequency = thisByte[lang];
        langScore[Number(lang)] +=
          (frequency > globalFrequency
            ? globalFrequency / frequency
            : frequency / globalFrequency) *
            relevancy +
          2;
      }
    }
  }

  // This divisor will produce a final score between 0 - ~1, score could be >1. Can be improved.
  const resultDivisor = numNgrams * 3.2;
  const results: [number, number][] = [];
  for (const lang in langScore) {
    if (langScore[lang]) {
      // Javascript does Not guarantee object order, so a multi-array is used
      results.push([
        Number.parseInt(lang, 10),
        langScore[lang] / resultDivisor,
      ]);
    }
  }
  return results;
}

/**
 * Converts each byte to a single character, using our own dictionary, since javascript does not allow raw byte
 * strings or invalid UTF-8 characters. We could use TextEncoder() to create an Uint8Array, and then translate to our
 * dictionary, but this function is overall faster as it does both jobs at once
 *
 * Alternatives such as just using Uint8Array/hex for detection adds complexity and or a bigger database
 */
function strToUtf8Bytes(str: string): string[] {
  let encoded = '';
  const words: string[] = [];
  let countBytes = 0;
  const cutAfter = 350; // Cut to first whitespace after 350 byte length offset
  const enforceCutAfter = 380; // Cut after any UTF-8 character when surpassing 380 byte length

  for (let ii = 0; ii < str.length; ii++) {
    let charCode = str.charCodeAt(ii);

    if (charCode < 0x80) {
      if (charCode === 32) {
        if (encoded !== '') {
          words.push(encoded);
          encoded = '';
        }
        if (countBytes > cutAfter) {
          break;
        }
      } else {
        encoded += str[ii];
      }
      countBytes++;
    } else if (charCode < 0x800) {
      encoded +=
        dictionary[0xc0 | (charCode >> 6)] +
        dictionary[0x80 | (charCode & 0x3f)];
      countBytes += 2;
    } else if (charCode < 0xd800 || charCode >= 0xe000) {
      encoded +=
        dictionary[0xe0 | (charCode >> 12)] +
        dictionary[0x80 | ((charCode >> 6) & 0x3f)] +
        dictionary[0x80 | (charCode & 0x3f)];
      countBytes += 3;
    } else {
      // UTF-16
      ii++;
      charCode =
        0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(ii) & 0x3ff));
      encoded +=
        dictionary[0xf0 | (charCode >> 18)] +
        dictionary[0x80 | ((charCode >> 12) & 0x3f)] +
        dictionary[0x80 | ((charCode >> 6) & 0x3f)] +
        dictionary[0x80 | (charCode & 0x3f)];
      countBytes += 4;
    }
    if (countBytes > enforceCutAfter) {
      break;
    }
  }
  if (encoded !== '') {
    words.push(encoded);
    // It is faster to build the array than to words.split(/ +/).filter((x) => x !== ' ') later
  }
  return words;
}

export const eld = { detect };
