import { describe, expect, it } from "vitest";
import { parseAssetIdentityInput } from "@/features/asset-identity-validator/schema";
import {
  issuer,
  secretSeed,
  validCode,
  wrappedIssuer
} from "@/features/asset-identity-validator/fixtures/assetIdentityValidator.fixture";

describe("parseAssetIdentityInput", () => {
  it("rejects an empty or whitespace-only code", () => {
    expect(parseAssetIdentityInput({ code: "", issuer })).toEqual({
      ok: false,
      code: "empty_code"
    });
    expect(parseAssetIdentityInput({ code: " \n\t ", issuer })).toEqual({
      ok: false,
      code: "empty_code"
    });
  });

  it("trims the code and strips whitespace inside a wrapped issuer", () => {
    const result = parseAssetIdentityInput({ code: ` ${validCode} `, issuer: wrappedIssuer });

    expect(result).toEqual({ ok: true, value: { code: validCode, issuer } });
  });

  it("rejects a secret seed immediately and does not return it", () => {
    const spaced = `${secretSeed.slice(0, 10)}\n${secretSeed.slice(10)}`;
    const result = parseAssetIdentityInput({ code: "", issuer: spaced });

    expect(result).toEqual({ ok: false, code: "invalid_issuer" });
    expect(JSON.stringify(result)).not.toContain(secretSeed);
  });

  it("leaves character and length failures for the domain check", () => {
    const result = parseAssetIdentityInput({ code: "usdc-too-long", issuer });

    expect(result).toEqual({ ok: true, value: { code: "usdc-too-long", issuer } });
  });
});
