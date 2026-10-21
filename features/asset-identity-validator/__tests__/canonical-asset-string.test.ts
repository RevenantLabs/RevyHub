import { describe, expect, it } from "vitest";
import { buildCanonicalAssetString } from "@/features/asset-identity-validator/lib/canonical-asset-string";
import {
  issuer,
  secretSeed,
  validCode
} from "@/features/asset-identity-validator/fixtures/assetIdentityValidator.fixture";
import { alphanum12Codes } from "@/features/asset-identity-validator/fixtures/alphanum12-codes.fixture";

describe("buildCanonicalAssetString", () => {
  it("joins the code and issuer with a single colon and no extra space", () => {
    expect(buildCanonicalAssetString(validCode, issuer)).toEqual({
      ok: true,
      value: `${validCode}:${issuer}`
    });
    expect(buildCanonicalAssetString(alphanum12Codes.shortest, issuer)).toEqual({
      ok: true,
      value: `${alphanum12Codes.shortest}:${issuer}`
    });
  });

  it("refuses an empty side", () => {
    expect(buildCanonicalAssetString("", issuer)).toEqual({ ok: false, code: "empty_code" });
    expect(buildCanonicalAssetString(validCode, "")).toEqual({ ok: false, code: "invalid_issuer" });
  });

  it("does not embed a secret seed in the string or the error", () => {
    const result = buildCanonicalAssetString(validCode, secretSeed);

    expect(result).toEqual({ ok: false, code: "invalid_issuer" });
    expect(JSON.stringify(result)).not.toContain(secretSeed);
  });
});
