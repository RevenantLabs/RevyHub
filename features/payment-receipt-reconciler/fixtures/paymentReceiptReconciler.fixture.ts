import { Keypair } from "@stellar/stellar-sdk";
import type { PaymentReceipt } from "@/features/payment-receipt-reconciler/types";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const sourceAccount = seed(1).publicKey();
export const destinationAccount = seed(2).publicKey();
export const issuerAccount = seed(3).publicKey();

export const successfulHash = "a".repeat(64);
export const failedHash = "b".repeat(64);
export const missingHash = "c".repeat(64);
export const unsupportedHash = "d".repeat(64);
export const incompleteHash = "e".repeat(64);
export const mixedHash = "f".repeat(64);

/** Operation TOIDs used by effects — decimal strings Horizon returns. */
export const paymentOpId = "4398046511105";
export const changeTrustOpId = "4398046511106";
export const pathPaymentOpId = "4398046511107";

export const successfulTransaction = {
  hash: successfulHash,
  ledger: 2_048_000,
  successful: true,
  source_account: sourceAccount,
  fee_charged: "100",
  created_at: "2026-05-02T10:14:05Z",
  operation_count: 1,
  _links: { self: { href: "" } },
  paging_token: "1",
  id: successfulHash
};

export const failedTransaction = {
  ...successfulTransaction,
  hash: failedHash,
  id: failedHash,
  successful: false,
  operation_count: 1
};

export const unsupportedTransaction = {
  ...successfulTransaction,
  hash: unsupportedHash,
  id: unsupportedHash,
  operation_count: 1
};

export const incompleteTransaction = {
  ...successfulTransaction,
  hash: incompleteHash,
  id: incompleteHash,
  operation_count: 1
};

export const paymentOperation = {
  id: paymentOpId,
  type: "payment",
  source_account: sourceAccount,
  from: sourceAccount,
  to: destinationAccount,
  amount: "12.5000000",
  asset_type: "native",
  paging_token: paymentOpId
};

export const changeTrustOperation = {
  id: changeTrustOpId,
  type: "change_trust",
  source_account: sourceAccount,
  asset_type: "credit_alphanum4",
  asset_code: "USDC",
  asset_issuer: issuerAccount,
  limit: "1000.0000000",
  paging_token: changeTrustOpId
};

export const debitEffect = {
  id: `${paymentOpId}-1`,
  type: "account_debited",
  account: sourceAccount,
  amount: "12.5000000",
  asset_type: "native",
  created_at: "2026-05-02T10:14:05Z",
  paging_token: `${paymentOpId}-1`
};

export const creditEffect = {
  id: `${paymentOpId}-2`,
  type: "account_credited",
  account: destinationAccount,
  amount: "12.5000000",
  asset_type: "native",
  created_at: "2026-05-02T10:14:05Z",
  paging_token: `${paymentOpId}-2`
};

export const trustlineEffect = {
  id: `${changeTrustOpId}-1`,
  type: "trustline_created",
  account: sourceAccount,
  asset_type: "credit_alphanum4",
  asset_code: "USDC",
  asset_issuer: issuerAccount,
  limit: "1000.0000000",
  created_at: "2026-05-02T10:14:05Z",
  paging_token: `${changeTrustOpId}-1`
};

function page<T>(records: T[]) {
  return {
    _links: { self: { href: "" }, next: { href: "" }, prev: { href: "" } },
    _embedded: { records }
  };
}

export const paymentOperationsPage = page([paymentOperation]);
export const paymentEffectsPage = page([debitEffect, creditEffect]);
export const emptyPage = page([]);

export const unsupportedOperationsPage = page([changeTrustOperation]);
export const unsupportedEffectsPage = page([trustlineEffect]);

export const incompleteOperationsPage = page([paymentOperation]);
export const incompleteEffectsPage = page([debitEffect]);

export const successfulReceipt: PaymentReceipt = {
  hash: successfulHash,
  network: "testnet",
  ledger: 2_048_000,
  createdAt: "2026-05-02T10:14:05Z",
  sourceAccount,
  feeCharged: "100",
  operations: [
    {
      id: paymentOpId,
      type: "payment",
      sourceAccount,
      from: sourceAccount,
      to: destinationAccount,
      amount: "12.5000000",
      asset: { type: "native" }
    }
  ],
  links: [
    {
      operationId: paymentOpId,
      debits: [
        {
          id: debitEffect.id,
          type: "account_debited",
          account: sourceAccount,
          amount: "12.5000000",
          asset: { type: "native" },
          operationId: paymentOpId
        }
      ],
      credits: [
        {
          id: creditEffect.id,
          type: "account_credited",
          account: destinationAccount,
          amount: "12.5000000",
          asset: { type: "native" },
          operationId: paymentOpId
        }
      ]
    }
  ],
  totals: {
    debits: [{ asset: { type: "native" }, amount: "12.5" }],
    credits: [{ asset: { type: "native" }, amount: "12.5" }],
    feeCharged: "100"
  },
  outside: [],
  publicReceipt: {
    hash: successfulHash,
    network: "testnet",
    ledger: 2_048_000
  }
};
