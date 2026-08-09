# src/eld

This directory vendors a trimmed-down port of
[nitotm/efficient-language-detector-js](https://github.com/nitotm/efficient-language-detector-js)
(published to npm as `efficient-language-detector-no-dynamic-import`), licensed under the
[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

## Why this exists

The upstream package embeds its M60 ngrams dataset as a ~1.9 MB JS object literal that is
evaluated via a top-level `await` at module load time. V8 parses an equivalent
`JSON.parse(jsonString)` form roughly 3x faster than a raw object literal of the same size.
On Cloudflare Workers, the difference was enough to blow past the ~400ms startup CPU limit and
fail deployment.

Since the upstream package imports its ngrams data via a relative path
(`./ngrams/ngramsM60.js`), and esbuild's `alias` option does not support relative specifiers,
the data module cannot be swapped via bundler config alone. So the detection logic — a handful
of small, self-contained functions — is ported here, and the ngrams data is regenerated into a
`JSON.parse`-based module by `scripts/generate-ngrams.mjs` (run `npm run generate:ngrams`).

## What's included vs. dropped

Only what `eld.detect(text).language` needs is ported, verbatim in logic, from
`languageDetector.js`: `detect`, `textProcessor`, `getByteNgrams`, `calculateScores`,
`strToUtf8Bytes`, plus the M60 ngrams dataset, the byte dictionary, and the `separators` regex.

Not ported, because this app never calls them: `cleanText`/`getCleanTxt` (text cleaning is off
by default and unused here), `dynamicLangSubset`/`makeSubset`/`filterLangSubset`/`saveSubset`/
`info`/`isoLanguages`, the `LanguageResult` class and `avgScore` (only `.language` is read, not
`.getScores()`/`.isReliable()`), and the browser-only `saveLanguageSubset.dev.js`.

## Maintenance

`efficient-language-detector-no-dynamic-import` stays a devDependency, used only by
`scripts/generate-ngrams.mjs` (to regenerate `ngrams-m60.ts`) and by
`scripts/verify-parity.mjs` (to check output still matches upstream after any changes here).
It is never imported by the deployed Worker.
