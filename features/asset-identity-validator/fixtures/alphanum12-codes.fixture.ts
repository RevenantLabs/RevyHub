/**
 * Alphanumeric-12 edges.
 *
 * Five and twelve characters are the tier bounds. `tooLong` is one character
 * past the tier, so length fails before the alphabet is considered.
 */
export const alphanum12Codes = {
  shortest: "ABCDE",
  longest: "ABCDEFGHIJKL",
  digits: "123456789012",
  mixed: "A1B2C3D4E5F6",
  tooLong: "ABCDEFGHIJKLM",
  lowercase: "abcdefghijkl",
  hyphen: "ABCDE-FGHIJK"
} as const;
