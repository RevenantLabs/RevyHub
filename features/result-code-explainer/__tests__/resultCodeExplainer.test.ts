import { describe, expect, it } from "vitest";
import {
  camelToSnake,
  decodeResultXdr,
  explainResultCodes
} from "@/features/result-code-explainer/lib/resultCodeExplainer";
import { lookupResultCode, RESULT_CODE_TABLE } from "@/features/result-code-explainer/lib/resultCodes";
import {
  badSequenceResultXdr,
  failedPaymentResultXdr
} from "@/features/result-code-explainer/fixtures/resultCodeExplainer.fixture";

describe("lookupResultCode", () => {
  it("explains a known transaction code", () => {
    const entry = lookupResultCode("tx_bad_seq");
    expect(entry.known).toBe(true);
    expect(entry.title).toMatch(/sequence/i);
  });

  it("maps common aliases to canonical codes", () => {
    const entry = lookupResultCode("op_underfunded");
    expect(entry.code).toBe("payment_underfunded");
    expect(entry.known).toBe(true);
  });

  it("marks unknown codes without inventing detail", () => {
    const entry = lookupResultCode("totally_made_up_code");
    expect(entry.known).toBe(false);
    expect(entry.title).toMatch(/unknown/i);
  });

  it("ships at least thirty curated codes", () => {
    expect(Object.keys(RESULT_CODE_TABLE).length).toBeGreaterThanOrEqual(30);
  });
});

describe("camelToSnake", () => {
  it("normalises XDR enum names", () => {
    expect(camelToSnake("paymentUnderfunded")).toBe("payment_underfunded");
    expect(camelToSnake("txFailed")).toBe("tx_failed");
  });
});

describe("decodeResultXdr", () => {
  it("decodes a failed payment result", () => {
    const result = decodeResultXdr(failedPaymentResultXdr);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.transactionCode).toBe("tx_failed");
    expect(result.value.feeCharged).toBe("100");
    expect(result.value.operations[0]).toMatchObject({
      operationType: "payment",
      innerCode: "payment_underfunded"
    });
  });

  it("decodes a transaction-level failure without operations", () => {
    const result = decodeResultXdr(badSequenceResultXdr);
    expect(result.ok && result.value.transactionCode).toBe("tx_bad_seq");
    expect(result.ok && result.value.operations).toEqual([]);
  });

  it("rejects malformed base64 payloads", () => {
    expect(decodeResultXdr("AAAA")).toEqual({ ok: false, code: "invalid_xdr" });
  });
});

describe("explainResultCodes", () => {
  it("explains pasted codes", () => {
    const result = explainResultCodes({ mode: "code", value: "tx_failed, payment_no_trust" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.explanations).toHaveLength(2);
  });

  it("filters explanations with search", () => {
    const result = explainResultCodes({
      mode: "code",
      value: "tx_failed, payment_no_trust",
      search: "trustline"
    });
    expect(result.ok && result.value.explanations).toHaveLength(1);
    expect(result.ok && result.value.explanations[0]?.code).toBe("payment_no_trust");
  });

  it("explains every code in a result XDR", () => {
    const result = explainResultCodes({ mode: "xdr", value: failedPaymentResultXdr });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.transactionCode).toBe("tx_failed");
    expect(result.value.operations[0]?.innerCode).toBe("payment_underfunded");
    expect(result.value.explanations.some((entry) => entry.code === "payment_underfunded")).toBe(
      true
    );
  });

  it("returns unknown_code when a single paste is unrecognised", () => {
    expect(explainResultCodes({ mode: "code", value: "zzzz_not_a_code" })).toEqual({
      ok: false,
      code: "unknown_code"
    });
  });
});
