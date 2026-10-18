import { describe, expect, it } from "vitest";
import {
  identifyEnvelope,
  normalizeFeeFields
} from "@/features/transaction-fee-charge-audit/lib/fee-fields";
import {
  classicHorizonTransaction,
  feeBumpHorizonTransaction,
  feeBumpInnerFee,
  feeSourceAccount,
  malformedFeeHorizonTransaction,
  sourceAccount
} from "@/features/transaction-fee-charge-audit/fixtures/transactionFeeChargeAudit.fixture";

describe("identifyEnvelope", () => {
  it("identifies a classic envelope from XDR", () => {
    expect(identifyEnvelope(classicHorizonTransaction, "testnet")).toEqual({ kind: "classic" });
  });

  it("identifies a fee-bump envelope and keeps outer and inner sources separate", () => {
    const identity = identifyEnvelope(feeBumpHorizonTransaction, "testnet");
    expect(identity).toEqual({
      kind: "fee_bump",
      outerFeeSource: feeSourceAccount,
      innerSourceAccount: sourceAccount,
      innerFee: feeBumpInnerFee
    });
  });

  it("falls back to fee_account when envelope XDR is absent", () => {
    const withoutXdr = { ...feeBumpHorizonTransaction, envelope_xdr: "" };
    const identity = identifyEnvelope(withoutXdr, "testnet");
    expect(identity.kind).toBe("fee_bump");
    if (identity.kind !== "fee_bump") return;
    expect(identity.outerFeeSource).toBe(feeSourceAccount);
    expect(identity.innerFee).toBe(feeBumpInnerFee);
  });
});

describe("normalizeFeeFields", () => {
  it("normalises classic fee fields", () => {
    const result = normalizeFeeFields(classicHorizonTransaction, "testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toMatchObject({
      kind: "classic",
      sourceAccount,
      fees: { maxFee: "10000", feeCharged: "200", difference: "9800" }
    });
  });

  it("keeps fee-bump inner fee separate from the outer charge audit", () => {
    const result = normalizeFeeFields(feeBumpHorizonTransaction, "testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.kind).toBe("fee_bump");
    if (result.value.kind !== "fee_bump") return;
    expect(result.value.innerFee).toBe(feeBumpInnerFee);
    expect(result.value.fees.feeCharged).toBe("300");
  });

  it("returns invalid_fee_data for malformed fee fields", () => {
    expect(normalizeFeeFields(malformedFeeHorizonTransaction, "testnet")).toEqual({
      ok: false,
      code: "invalid_fee_data"
    });
  });
});
