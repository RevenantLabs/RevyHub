import { Keypair } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const sourceId = seed(1).publicKey();
export const destinationId = seed(2).publicKey();
export const source2Id = seed(3).publicKey();
export const sponsorId = seed(4).publicKey();

export const baseAccountRecord = {
  id: sourceId,
  account_id: sourceId,
  sequence: "1",
  subentry_count: 0,
  last_modified_ledger: 1,
  last_modified_time: "2023-01-01T00:00:00Z",
  thresholds: { low_threshold: 1, med_threshold: 1, high_threshold: 1 },
  flags: { auth_required: false, auth_revocable: false, auth_immutable: false },
  balances: [{ balance: "100.0000000", asset_type: "native" }],
  signers: [{ key: sourceId, weight: 1, type: "ed25519_public_key" }],
  data_attr: {},
  num_sponsoring: 0,
  num_sponsored: 0,
  paging_token: "1",
} as unknown as import("@stellar/stellar-sdk").Horizon.ServerApi.AccountRecord;
