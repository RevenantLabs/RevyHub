import { describe, expect, it } from "vitest";
import { formatCanonicalAssetString, formatCodeLength, formatTier } from "@/features/asset-identity-validator/lib/format";
import {
  isCodeProblem,
  isIssuerProblem,
  shouldRedact,
  toAssetIdentityErrorCode
} from "@/features/asset-identity-validator/lib/assetIdentityValidator.errors";
import { copy } from "@/features/asset-identity-validator/copy";
import {
  canonical,
  secretSeed
} from "@/features/asset-identity-validator/fixtures/assetIdentityValidator.fixture";

describe("formatTier", () => {
  it("uses the copy labels for both tiers", () => {
    expect(formatTier("alphanum4")).toBe(copy.tierAlphanum4);
    expect(formatTier("alphanum12")).toBe(copy.tierAlphanum12);
  });
});

describe("formatCodeLength", () => {
  it("pluralises the length line", () => {
    expect(formatCodeLength(1)).toBe(`1 ${copy.lengthSingular}`);
    expect(formatCodeLength(12)).toBe(`12 ${copy.lengthPlural}`);
  });
});

describe("formatCanonicalAssetString", () => {
  it("displays the canonical string unchanged", () => {
    expect(formatCanonicalAssetString(canonical)).toBe(canonical);
    expect(formatCanonicalAssetString(canonical)).not.toMatch(/\s/);
  });
});

describe("error helpers", () => {
  it("separates code problems from issuer problems", () => {
    expect(isCodeProblem("invalid_code_length")).toBe(true);
    expect(isCodeProblem("invalid_code_characters")).toBe(true);
    expect(isCodeProblem("reserved_native_conflict")).toBe(true);
    expect(isIssuerProblem("invalid_issuer")).toBe(true);
    expect(isIssuerProblem("empty_code")).toBe(false);
  });

  it("redacts only a secret issuer", () => {
    expect(shouldRedact("invalid_issuer", secretSeed)).toBe(true);
    expect(shouldRedact("invalid_issuer", `  ${secretSeed.slice(0, 8)}`)).toBe(true);
    expect(shouldRedact("invalid_code_length", secretSeed)).toBe(false);
  });

  it("maps SDK failures without keeping the thrown message", () => {
    expect(toAssetIdentityErrorCode(new Error("Issuer is invalid"))).toBe("invalid_issuer");
    expect(toAssetIdentityErrorCode(new Error("Asset code is invalid (maximum alphanumeric, 12 characters at max)"))).toBe(
      "invalid_code_characters"
    );
    expect(toAssetIdentityErrorCode(new Error("XLM cannot have an issuer"))).toBe(
      "reserved_native_conflict"
    );

    const mapped = toAssetIdentityErrorCode(new Error(`Issuer is invalid: ${secretSeed}`));
    expect(mapped).toBe("invalid_issuer");
    expect(JSON.stringify(mapped)).not.toContain(secretSeed);
  });
});
