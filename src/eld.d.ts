declare module 'efficient-language-detector-no-dynamic-import' {
  export const eld: {
    detect: (text: string) => { language: string };
  };
}
