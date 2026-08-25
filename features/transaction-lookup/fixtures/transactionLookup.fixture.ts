import { Keypair } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const sourceAccount = seed(1).publicKey();
export const successfulHash = "a".repeat(64);
export const failedHash = "b".repeat(64);
export const missingHash = "c".repeat(64);

export const successfulTransaction = {
  hash: successfulHash,
  ledger: 1017696,
  successful: true,
  source_account: sourceAccount,
  fee_charged: "100",
  max_fee: "10000",
  operation_count: 2,
  created_at: "2026-05-02T10:14:05Z",
  memo_type: "text",
  memo: "Invoice 1001",
  _links: { self: { href: "" } },
  paging_token: "1",
  id: successfulHash,
  envelope_xdr: "",
  result_xdr: "",
  result_meta_xdr: "",
  fee_meta_xdr: "",
  signatures: []
};

export const failedTransaction = {
  ...successfulTransaction,
  hash: failedHash,
  id: failedHash,
  successful: false,
  memo_type: "none",
  memo: undefined,
  operation_count: 1
};

export const operationsPage = {
  _links: { self: { href: "" }, next: { href: "" }, prev: { href: "" } },
  _embedded: {
    records: [
      { id: "1", type: "payment", source_account: sourceAccount, paging_token: "1" },
      { id: "2", type: "change_trust", source_account: sourceAccount, paging_token: "2" }
    ]
  }
};

export const emptyOperationsPage = {
  _links: { self: { href: "" }, next: { href: "" }, prev: { href: "" } },
  _embedded: { records: [] }
};
