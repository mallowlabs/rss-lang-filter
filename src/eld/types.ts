export interface NgramsData {
  type: string;
  languages: Record<string, string>;
  ngrams: Record<string, Record<string, number>>;
}
