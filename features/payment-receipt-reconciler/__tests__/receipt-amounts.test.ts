import { describe, expect, it } from "vitest";
import {
  stroopsToAmount,
  sumReceiptAmounts
} from "@/features/payment-receipt-reconciler/lib/receipt-amounts";
import type { EffectLink } from "@/features/payment-receipt-reconciler/types";
import {
  destinationAccount,
  issuerAccount,
  paymentOpId,
  sourceAccount
} from "@/features/payment-receipt-reconciler/fixtures/paymentReceiptReconciler.fixture";

const nativeLink: EffectLink = {
  operationId: paymentOpId,
  debits: [
    {
      id: `${paymentOpId}-1`,
      type: "account_debited",
      account: sourceAccount,
      amount: "12.5000000",
      asset: { type: "native" },
      operationId: paymentOpId
    }
  ],
  credits: [
    {
      id: `${paymentOpId}-2`,
      type: "account_credited",
      account: destinationAccount,
      amount: "12.5000000",
      asset: { type: "native" },
      operationId: paymentOpId
    }
  ]
};

describe("stroopsToAmount", () => {
  it("round-trips integer stroops", () => {
    expect(stroopsToAmount(125_000_000n)).toBe("12.5");
    expect(stroopsToAmount(1n)).toBe("0.0000001");
  });
});

describe("sumReceiptAmounts", () => {
  it("sums exact debits and credits and keeps the fee separate", () => {
    const totals = sumReceiptAmounts([nativeLink], "100");

    expect(totals.debits).toEqual([{ asset: { type: "native" }, amount: "12.5" }]);
    expect(totals.credits).toEqual([{ asset: { type: "native" }, amount: "12.5" }]);
    expect(totals.feeCharged).toBe("100");
  });

  it("groups credit assets by code and issuer", () => {
    const creditAsset = { type: "credit" as const, code: "USDC", issuer: issuerAccount };
    const link: EffectLink = {
      operationId: paymentOpId,
      debits: [
        {
          id: `${paymentOpId}-1`,
          type: "account_debited",
          account: sourceAccount,
          amount: "10.0000000",
          asset: { type: "native" },
          operationId: paymentOpId
        },
        {
          id: `${paymentOpId}-3`,
          type: "account_debited",
          account: sourceAccount,
          amount: "2.5000000",
          asset: { type: "native" },
          operationId: paymentOpId
        }
      ],
      credits: [
        {
          id: `${paymentOpId}-2`,
          type: "account_credited",
          account: destinationAccount,
          amount: "5.0000000",
          asset: creditAsset,
          operationId: paymentOpId
        },
        {
          id: `${paymentOpId}-4`,
          type: "account_credited",
          account: destinationAccount,
          amount: "1.2500000",
          asset: creditAsset,
          operationId: paymentOpId
        }
      ]
    };

    const totals = sumReceiptAmounts([link], "300");
    expect(totals.debits).toEqual([{ asset: { type: "native" }, amount: "12.5" }]);
    expect(totals.credits).toEqual([{ asset: creditAsset, amount: "6.25" }]);
    expect(totals.feeCharged).toBe("300");
  });
});
