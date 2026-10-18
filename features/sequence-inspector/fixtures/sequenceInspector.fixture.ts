import { Keypair } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const accountId = seed(21).publicKey();
export const missingAccountId = seed(22).publicKey();
export const secretSeed = seed(23).secret();

export const creationLedger = 1_234_567n;
export const offset = 4_000_000_000n;
export const currentSequence = (creationLedger << 32n) | offset;
export const nextSequence = currentSequence + 1n;
export const creationLedgerMaximum = (creationLedger << 32n) | 0xffff_ffffn;
export const bumpTarget = currentSequence + 12_345n;
export const sequenceUpdatedLedger = 2_345_678n;

export const horizonAccount = {
  account_id: accountId,
  sequence: currentSequence.toString(),
  sequence_ledger: sequenceUpdatedLedger.toString(),
  _links: { self: { href: "" } },
  paging_token: accountId,
  subentry_count: 0,
  last_modified_ledger: 2_345_678,
  thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
  flags: {
    auth_required: false,
    auth_revocable: false,
    auth_immutable: false,
    auth_clawback_enabled: false
  },
  balances: [],
  signers: [],
  data: {}
};
