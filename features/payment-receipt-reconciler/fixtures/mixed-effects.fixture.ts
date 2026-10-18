import {
  changeTrustOperation,
  creditEffect,
  debitEffect,
  destinationAccount,
  issuerAccount,
  pathPaymentOpId,
  paymentOpId,
  sourceAccount,
  successfulTransaction,
  trustlineEffect
} from "@/features/payment-receipt-reconciler/fixtures/paymentReceiptReconciler.fixture";

/**
 * Mixed transaction: a path-payment plus an unrelated change_trust, with a
 * trade effect sitting beside the debit/credit pair.
 */
export const mixedEffectsHash = "2".repeat(64);

export const mixedEffectsTransaction = {
  ...successfulTransaction,
  hash: mixedEffectsHash,
  id: mixedEffectsHash,
  fee_charged: "300",
  ledger: 3_200_002,
  operation_count: 2
};

export const pathPaymentOperation = {
  id: pathPaymentOpId,
  type: "path_payment_strict_send",
  source_account: sourceAccount,
  from: sourceAccount,
  to: destinationAccount,
  amount: "5.0000000",
  asset_type: "credit_alphanum4",
  asset_code: "USDC",
  asset_issuer: issuerAccount,
  source_amount: "10.0000000",
  source_asset_type: "native",
  paging_token: pathPaymentOpId
};

export const pathDebitEffect = {
  id: `${pathPaymentOpId}-1`,
  type: "account_debited",
  account: sourceAccount,
  amount: "10.0000000",
  asset_type: "native",
  created_at: "2026-05-02T11:00:00Z",
  paging_token: `${pathPaymentOpId}-1`
};

export const pathCreditEffect = {
  id: `${pathPaymentOpId}-2`,
  type: "account_credited",
  account: destinationAccount,
  amount: "5.0000000",
  asset_type: "credit_alphanum4",
  asset_code: "USDC",
  asset_issuer: issuerAccount,
  created_at: "2026-05-02T11:00:00Z",
  paging_token: `${pathPaymentOpId}-2`
};

export const tradeEffect = {
  id: `${pathPaymentOpId}-3`,
  type: "trade",
  account: sourceAccount,
  sold_amount: "10.0000000",
  sold_asset_type: "native",
  bought_amount: "5.0000000",
  bought_asset_type: "credit_alphanum4",
  bought_asset_code: "USDC",
  bought_asset_issuer: issuerAccount,
  created_at: "2026-05-02T11:00:00Z",
  paging_token: `${pathPaymentOpId}-3`
};

function page<T>(records: T[]) {
  return {
    _links: { self: { href: "" }, next: { href: "" }, prev: { href: "" } },
    _embedded: { records }
  };
}

export const mixedEffectsOperationsPage = page([pathPaymentOperation, changeTrustOperation]);
export const mixedEffectsEffectsPage = page([
  pathDebitEffect,
  pathCreditEffect,
  tradeEffect,
  trustlineEffect
]);

export {
  sourceAccount,
  destinationAccount,
  issuerAccount,
  paymentOpId,
  pathPaymentOpId,
  debitEffect,
  creditEffect
};
