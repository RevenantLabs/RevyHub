import {
  changeTrustOperation,
  creditEffect,
  debitEffect,
  destinationAccount,
  issuerAccount,
  paymentOpId,
  paymentOperation,
  sourceAccount,
  successfulTransaction,
  trustlineEffect
} from "@/features/payment-receipt-reconciler/fixtures/paymentReceiptReconciler.fixture";

/** Deterministic edge-case: single native payment with matching effects. */
export const paymentReceiptHash = "1".repeat(64);

export const paymentReceiptTransaction = {
  ...successfulTransaction,
  hash: paymentReceiptHash,
  id: paymentReceiptHash,
  fee_charged: "200",
  ledger: 3_100_001,
  operation_count: 1
};

export const paymentReceiptOperationsPage = {
  _links: { self: { href: "" }, next: { href: "" }, prev: { href: "" } },
  _embedded: {
    records: [
      {
        ...paymentOperation,
        amount: "1.0000000"
      }
    ]
  }
};

export const paymentReceiptEffectsPage = {
  _links: { self: { href: "" }, next: { href: "" }, prev: { href: "" } },
  _embedded: {
    records: [
      { ...debitEffect, amount: "1.0000000" },
      { ...creditEffect, amount: "1.0000000" }
    ]
  }
};

export { sourceAccount, destinationAccount, issuerAccount, paymentOpId };
