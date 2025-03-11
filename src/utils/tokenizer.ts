import { encode, decode } from 'gpt-tokenizer/encoding/o200k_base';

export interface TokenizerResult {
  tokens: number[];
  text: string;
  count: number;
}

export function tokenizeText(text: string): TokenizerResult {
  const tokens = encode(text);
  return {
    tokens,
    text,
    count: tokens.length
  };
}

export function detokenize(tokens: number[]): string {
  return decode(tokens);
}

export function countTokens(text: string): number {
  return encode(text).length;
}
