import { describe, expect, it } from "vitest";
import { FIELD_OF_CODE, parseTrustlineInput } from "@/features/trustline-checker/schema";
import {
  accountId,
  issuerId
} from "@/features/trustline-checker/fixtures/trustlineChecker.fixture";

const valid = { accountId, assetCode: "USDC", issuerId };

describe("parseTrustlineInput", () => {
  it("accepts a complete, valid request", () => {
    const result = parseTrustlineInput(valid);
    expect(result.ok && result.value).toEqual(valid);
  });

  it("upper-cases the asset code", () => {
    const result = parseTrustlineInput({ ...valid, assetCode: " usdc " });
    expect(result.ok && result.value.assetCode).toBe("USDC");
  });

  it.each([
    [{ ...valid, accountId: "" }, "empty_account"],
    [{ ...valid, accountId: "nope" }, "invalid_account"],
    [{ ...valid, assetCode: "" }, "empty_asset_code"],
    [{ ...valid, assetCode: "TOO-LONG-CODE!" }, "invalid_asset_code"],
    [{ ...valid, issuerId: "" }, "empty_issuer"],
    [{ ...valid, issuerId: "nope" }, "invalid_issuer"]
  ])("rejects invalid input with a specific code", (input, code) => {
    expect(parseTrustlineInput(input)).toEqual({ ok: false, code });
  });

  it("rejects an asset code longer than 12 characters", () => {
    expect(parseTrustlineInput({ ...valid, assetCode: "A".repeat(13) })).toEqual({
      ok: false,
      code: "invalid_asset_code"
    });
  });

  it("accepts an asset code of exactly 12 characters", () => {
    expect(parseTrustlineInput({ ...valid, assetCode: "A".repeat(12) }).ok).toBe(true);
  });

  it("rejects an account that is also the issuer", () => {
    expect(parseTrustlineInput({ ...valid, issuerId: accountId })).toEqual({
      ok: false,
      code: "self_issued"
    });
  });

  it("maps every validation code to the field that caused it", () => {
    expect(FIELD_OF_CODE.invalid_account).toBe("accountId");
    expect(FIELD_OF_CODE.invalid_asset_code).toBe("assetCode");
    expect(FIELD_OF_CODE.self_issued).toBe("issuerId");
    expect(FIELD_OF_CODE.request_failed).toBeNull();
  });
});
