// Type shim for the upstream package. The app itself now uses the vendored ./eld (see
// src/eld/README.md); this is only for scripts/generate-ngrams.mjs and any dev-time parity
// checks against the original package (a devDependency, never bundled into the Worker).
declare module 'efficient-language-detector-no-dynamic-import' {
  export const eld: {
    detect: (text: string) => { language: string };
  };
}

declare module 'efficient-language-detector-no-dynamic-import/src/ngrams/ngramsM60.js' {
  import type { NgramsData } from './eld/types';
  export const ngramsData: NgramsData;
}
