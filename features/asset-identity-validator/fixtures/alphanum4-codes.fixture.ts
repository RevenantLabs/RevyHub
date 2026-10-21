/**
 * Alphanumeric-4 edges.
 *
 * Length 1 and length 4 are inside the tier. The other rows are the same
 * length band with a character or reserved-code problem decided later.
 */
export const alphanum4Codes = {
  shortest: "A",
  longest: "USDC",
  digits: "0001",
  mixed: "A0Z9",
  native: "XLM",
  lowercase: "usdc",
  symbol: "US$",
  spaced: "US C"
} as const;
