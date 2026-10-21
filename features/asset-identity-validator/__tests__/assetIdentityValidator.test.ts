import { describe, expect, it } from "vitest";
import {
  RESERVED_NATIVE_CODE,
  validateAssetIdentity
} from "@/features/asset-identity-validator/lib/assetIdentityValidator";
import {
  contractAddress,
  issuer,
  lowerPrefixIssuer,
  muxedAddress,
  secondIssuer,
  secretSeed,
  truncatedIssuer,
  validCode
} from "@/features/asset-identity-validator/fixtures/assetIdentityValidator.fixture";
import { alphanum4Codes } from "@/features/asset-identity-validator/fixtures/alphanum4-codes.fixture";
import { alphanum12Codes } from "@/features/asset-identity-validator/fixtures/alphanum12-codes.fixture";

describe("validateAssetIdentity", () => {
  it("accepts an alphanumeric-4 code and returns the canonical string and tier", () => {
    const result = validateAssetIdentity({ code: validCode, issuer });

    expect(result).toEqual({
      ok: true,
      value: {
        code: validCode,
        issuer,
        tier: "alphanum4",
        length: 4,
        canonical: `${validCode}:${issuer}`
      }
    });
  });

  it("accepts both length edges of alphanumeric 12", () => {
    for (const code of [alphanum12Codes.shortest, alphanum12Codes.longest, alphanum12Codes.digits]) {
      const result = validateAssetIdentity({ code, issuer: secondIssuer });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.tier).toBe("alphanum12");
        expect(result.value.canonical).toBe(`${code}:${secondIssuer}`);
      }
    }
  });

  it("accepts a one-character code", () => {
    const result = validateAssetIdentity({ code: alphanum4Codes.shortest, issuer });

    expect(result.ok && result.value.tier).toBe("alphanum4");
    expect(result.ok && result.value.length).toBe(1);
  });

  it("trims surrounding whitespace without counting it as length", () => {
    const result = validateAssetIdentity({ code: `  ${validCode}  `, issuer: ` ${issuer} ` });

    expect(result.ok && result.value).toMatchObject({
      code: validCode,
      length: 4,
      canonical: `${validCode}:${issuer}`
    });
  });

  it("reports an empty code before the issuer is considered", () => {
    expect(validateAssetIdentity({ code: "   ", issuer })).toEqual({
      ok: false,
      code: "empty_code"
    });
  });

  it("reports length before characters when the code is past 12 characters", () => {
    const result = validateAssetIdentity({
      code: `${alphanum12Codes.tooLong}!!!`,
      issuer
    });

    expect(result).toEqual({ ok: false, code: "invalid_code_length" });
  });

  it("reports illegal characters once the length tier is valid", () => {
    expect(validateAssetIdentity({ code: alphanum4Codes.lowercase, issuer })).toEqual({
      ok: false,
      code: "invalid_code_characters"
    });
    expect(validateAssetIdentity({ code: alphanum4Codes.symbol, issuer })).toEqual({
      ok: false,
      code: "invalid_code_characters"
    });
    expect(validateAssetIdentity({ code: alphanum12Codes.hyphen, issuer })).toEqual({
      ok: false,
      code: "invalid_code_characters"
    });
  });

  it("rejects a secret seed before the native-code rule and does not echo it", () => {
    const result = validateAssetIdentity({ code: RESERVED_NATIVE_CODE, issuer: secretSeed });

    expect(result).toEqual({ ok: false, code: "invalid_issuer" });
    expect(JSON.stringify(result)).not.toContain(secretSeed);
  });

  it("rejects XLM paired with a custom issuer", () => {
    expect(validateAssetIdentity({ code: alphanum4Codes.native, issuer })).toEqual({
      ok: false,
      code: "reserved_native_conflict"
    });
  });

  it("rejects XLM with an empty issuer as a missing public address", () => {
    expect(validateAssetIdentity({ code: RESERVED_NATIVE_CODE, issuer: "" })).toEqual({
      ok: false,
      code: "invalid_issuer"
    });
  });

  it.each([
    ["empty", ""],
    ["truncated", truncatedIssuer],
    ["lower prefix", lowerPrefixIssuer],
    ["contract", contractAddress],
    ["muxed", muxedAddress]
  ])("rejects a %s issuer", (_label, badIssuer) => {
    expect(validateAssetIdentity({ code: validCode, issuer: badIssuer })).toEqual({
      ok: false,
      code: "invalid_issuer"
    });
  });
});
