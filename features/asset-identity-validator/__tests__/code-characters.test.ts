import { describe, expect, it } from "vitest";
import { validateCodeCharacters } from "@/features/asset-identity-validator/lib/code-characters";
import { alphanum4Codes } from "@/features/asset-identity-validator/fixtures/alphanum4-codes.fixture";
import { alphanum12Codes } from "@/features/asset-identity-validator/fixtures/alphanum12-codes.fixture";

describe("validateCodeCharacters", () => {
  it("accepts uppercase letters and digits in both tiers", () => {
    expect(validateCodeCharacters(alphanum4Codes.mixed)).toEqual({
      ok: true,
      value: { code: alphanum4Codes.mixed }
    });
    expect(validateCodeCharacters(alphanum12Codes.digits)).toEqual({
      ok: true,
      value: { code: alphanum12Codes.digits }
    });
  });

  it("rejects lowercase instead of rewriting it", () => {
    expect(validateCodeCharacters(alphanum4Codes.lowercase)).toEqual({
      ok: false,
      code: "invalid_code_characters"
    });
    expect(validateCodeCharacters(alphanum12Codes.lowercase)).toEqual({
      ok: false,
      code: "invalid_code_characters"
    });
  });

  it("rejects spaces, symbols and hyphens", () => {
    const spaced = validateCodeCharacters(alphanum4Codes.spaced);
    const symbol = validateCodeCharacters(alphanum4Codes.symbol);
    const hyphen = validateCodeCharacters(alphanum12Codes.hyphen);

    expect(spaced.ok).toBe(false);
    expect(symbol).toEqual({ ok: false, code: "invalid_code_characters" });
    expect(hyphen).toEqual({ ok: false, code: "invalid_code_characters" });
  });
});
