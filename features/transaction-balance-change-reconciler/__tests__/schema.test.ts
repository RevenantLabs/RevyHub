import { describe, expect, it } from "vitest";
import { tooLargeXdr } from "@/features/transaction-balance-change-reconciler/fixtures/boundary.fixture";
import {
  normalPayment,
  notBase64,
  secretSeed
} from "@/features/transaction-balance-change-reconciler/fixtures/normal.fixture";
import {
  MAX_XDR_LENGTH,
  parseTransactionBalanceChangeReconcilerInput
} from "@/features/transaction-balance-change-reconciler/schema";

const base = {
  envelopeXdr: normalPayment.envelopeXdr,
  resultXdr: normalPayment.resultXdr,
  metaXdr: normalPayment.metaXdr,
  networkPassphrase: normalPayment.networkPassphrase
};

describe("parseTransactionBalanceChangeReconcilerInput", () => {
  it("accepts a complete valid triple", () => {
    const parsed = parseTransactionBalanceChangeReconcilerInput(base);
    expect(parsed.ok).toBe(true);
  });

  it("strips whitespace from XDR blobs", () => {
    const parsed = parseTransactionBalanceChangeReconcilerInput({
      ...base,
      metaXdr: `  ${base.metaXdr.slice(0, 20)}\n${base.metaXdr.slice(20)}  `
    });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.value.metaXdr).toBe(base.metaXdr);
  });

  it("rejects empty fields", () => {
    expect(parseTransactionBalanceChangeReconcilerInput({ ...base, metaXdr: "" }).code).toBe(
      "empty_input"
    );
  });

  it("rejects a secret seed without echoing it", () => {
    const parsed = parseTransactionBalanceChangeReconcilerInput({
      ...base,
      envelopeXdr: secretSeed
    });
    expect(parsed).toEqual({ ok: false, code: "invalid_input" });
    expect(JSON.stringify(parsed)).not.toContain(secretSeed);
  });

  it("rejects malformed base64", () => {
    expect(
      parseTransactionBalanceChangeReconcilerInput({ ...base, resultXdr: notBase64 }).code
    ).toBe("malformed_data");
  });

  it("rejects oversized input", () => {
    expect(tooLargeXdr.length).toBeGreaterThan(MAX_XDR_LENGTH);
    expect(
      parseTransactionBalanceChangeReconcilerInput({ ...base, metaXdr: tooLargeXdr }).code
    ).toBe("too_large");
  });
});
