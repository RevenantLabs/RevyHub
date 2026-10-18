import { Keypair } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const accountId = seed(21).publicKey();
export const unknownAccountId = seed(22).publicKey();
export const underfundedAccountId = seed(23).publicKey();

export const accountResponse = {
  _links: { self: { href: "" } },
  id: accountId,
  account_id: accountId,
  sequence: "5302428712241721",
  subentry_count: 3,
  last_modified_ledger: 1_234_560,
  last_modified_time: "2026-08-20T10:14:05Z",
  thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
  flags: {
    auth_required: false,
    auth_revocable: false,
    auth_immutable: false,
    auth_clawback_enabled: false
  },
  balances: [
    {
      balance: "12.0000000",
      asset_type: "native",
      buying_liabilities: "0.0000000",
      selling_liabilities: "1.2500000"
    }
  ],
  signers: [{ weight: 1, key: accountId, type: "ed25519_public_key" }],
  data: {},
  num_sponsoring: 2,
  num_sponsored: 1,
  paging_token: accountId
};

export const underfundedAccountResponse = {
  ...accountResponse,
  id: underfundedAccountId,
  account_id: underfundedAccountId,
  balances: [
    {
      ...accountResponse.balances[0],
      balance: "1.5000000",
      selling_liabilities: "0.0000000"
    }
  ],
  signers: [{ weight: 1, key: underfundedAccountId, type: "ed25519_public_key" }],
  num_sponsoring: 0,
  num_sponsored: 0,
  paging_token: underfundedAccountId
};

export const ledgerSequence = 1_234_567;
export const ledgerResponse = {
  _links: {
    self: { href: "" },
    next: { href: "" },
    prev: { href: "" }
  },
  _embedded: {
    records: [
      {
        _links: { self: { href: "" } },
        id: "a".repeat(64),
        paging_token: String(ledgerSequence),
        hash: "a".repeat(64),
        prev_hash: "b".repeat(64),
        sequence: ledgerSequence,
        successful_transaction_count: 1,
        failed_transaction_count: 0,
        operation_count: 1,
        tx_set_operation_count: 1,
        closed_at: "2026-08-20T10:15:00Z",
        total_coins: "105000000000.0000000",
        fee_pool: "1.0000000",
        max_tx_set_size: 1000,
        protocol_version: 23,
        header_xdr: "",
        base_fee_in_stroops: 100,
        base_reserve_in_stroops: 5_000_000
      }
    ]
  }
};
