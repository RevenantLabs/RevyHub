import { describe, expect, it } from "vitest";
import { redactValue } from "../lib/utils";

/* ------------------------------------------------------------------ */
/*  redactValue utility                                                */
/* ------------------------------------------------------------------ */

describe("redactValue", () => {
  it("masks a Stellar public key preserving the G prefix and last 4 chars", () => {
    const key = "GCXKG6RN4ON6YJWUCYG6J6Y6Q7H6Q7H6Q7H6Q7H6Q7H6Q7H6Q7H6Q7H6";
    const result = redactValue(key);

    expect(result).toMatch(/^G/);
    expect(result).toContain("••••••••");
    expect(result.endsWith("Q7H6")).toBe(true);
    expect(result.length).toBeLessThan(key.length);
  });

  it("masks a transaction hash preserving the first 2 and last 4 chars", () => {
    const hash = "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789";
    const result = redactValue(hash);

    expect(result.startsWith("ab")).toBe(true);
    expect(result).toContain("••••••••");
    expect(result.endsWith("6789")).toBe(true);
    expect(result.length).toBeLessThan(hash.length);
  });

  it("masks an asset issuer address", () => {
    const issuer = "GBDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890";
    const result = redactValue(issuer);

    expect(result).toMatch(/^G/);
    expect(result).toContain("••••••••");
  });

  it("returns short strings unchanged", () => {
    expect(redactValue("Hello")).toBe("Hello");
    expect(redactValue("XM")).toBe("XM");
    expect(redactValue("")).toBe("");
  });

  it("returns strings under 12 characters unchanged", () => {
    expect(redactValue("12345678901")).toBe("12345678901");
  });

  it("applies 2-char head for strings between 12 and 55 chars", () => {
    const value = "abcdefghijklmno"; // 15 chars
    const result = redactValue(value);

    expect(result.startsWith("ab")).toBe(true);
    expect(result).toContain("••••••••");
    // a b c d e f g h i j k l m n o - last 4 = "lmno"
    expect(result.endsWith("lmno")).toBe(true);
  });

  it("does not expand strings that already fit the mask length", () => {
    // head(2) + mask(8) + tail(4) = 14, so a 14-char string stays unchanged
    const value = "abcdefghijklmn"; // 14 chars
    expect(redactValue(value)).toBe(value);

    // A 13-char string also stays unchanged
    const short = "abcdefghijklm"; // 13 chars
    expect(redactValue(short)).toBe(short);
  });

  it("preserves type context in masked output", () => {
    const key = "GCXKG6RN4ON6YJWUCYG6J6Y6Q7H6Q7H6Q7H6Q7H6Q7H6Q7H6Q7H6Q7H6";
    const result = redactValue(key);

    // Type context: starts with G (Stellar public key), has masked block
    expect(result).toMatch(/^G••••••••[A-Z0-9]+$/);
  });
});
