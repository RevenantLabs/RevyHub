import { describe, expect, it } from "vitest";
import {
  FIELD_OF_CODE,
  MEMO_MAX_BYTES,
  byteLength,
  parsePaymentRequest
} from "@/features/payment-qr/schema";
import {
  issuedForm,
  memoAtLimit,
  memoOverByteLimit,
  nativeForm
} from "@/features/payment-qr/fixtures/paymentQr.fixture";

describe("parsePaymentRequest", () => {
  it("accepts a native request", () => {
    const result = parsePaymentRequest(nativeForm);
    expect(result.ok && result.value.asset).toEqual({ kind: "native" });
  });

  it("upper-cases an issued asset code", () => {
    const result = parsePaymentRequest(issuedForm);
    expect(result.ok && result.value.asset).toMatchObject({ kind: "issued", code: "USDC" });
  });

  it.each([
    [{ ...nativeForm, destination: "" }, "empty_destination"],
    [{ ...nativeForm, destination: "nope" }, "invalid_destination"],
    [{ ...nativeForm, amount: "" }, "empty_amount"],
    [{ ...nativeForm, amount: "-5" }, "invalid_amount"],
    [{ ...nativeForm, amount: "0" }, "invalid_amount"],
    [{ ...nativeForm, amount: "ten" }, "invalid_amount"],
    [{ ...nativeForm, amount: "1.2.3" }, "invalid_amount"],
    [{ ...issuedForm, assetCode: "" }, "empty_asset_code"],
    [{ ...issuedForm, assetCode: "TOO LONG!" }, "invalid_asset_code"],
    [{ ...issuedForm, assetIssuer: "nope" }, "invalid_asset_issuer"]
  ])("rejects invalid input with a specific code", (form, code) => {
    expect(parsePaymentRequest(form)).toEqual({ ok: false, code });
  });

  it("rejects more than 7 decimal places", () => {
    expect(parsePaymentRequest({ ...nativeForm, amount: "1.12345678" })).toEqual({
      ok: false,
      code: "amount_too_precise"
    });
  });

  it("accepts exactly 7 decimal places", () => {
    expect(parsePaymentRequest({ ...nativeForm, amount: "1.1234567" }).ok).toBe(true);
  });

  it("measures the memo in bytes, not characters", () => {
    expect(byteLength(memoOverByteLimit)).toBeGreaterThan(MEMO_MAX_BYTES);
    expect(memoOverByteLimit.length).toBeLessThan(MEMO_MAX_BYTES);

    expect(parsePaymentRequest({ ...nativeForm, memo: memoOverByteLimit })).toEqual({
      ok: false,
      code: "memo_too_long"
    });
  });

  it("accepts a memo at exactly the byte limit", () => {
    expect(parsePaymentRequest({ ...nativeForm, memo: memoAtLimit }).ok).toBe(true);
  });

  it("rejects a message over 300 characters", () => {
    expect(parsePaymentRequest({ ...nativeForm, msg: "x".repeat(301) })).toEqual({
      ok: false,
      code: "message_too_long"
    });
  });

  it("maps validation codes to their form fields", () => {
    expect(FIELD_OF_CODE.amount_too_precise).toBe("amount");
    expect(FIELD_OF_CODE.memo_too_long).toBe("memo");
    expect(FIELD_OF_CODE.qr_generation_failed).toBeNull();
  });
});
