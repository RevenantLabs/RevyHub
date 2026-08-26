import { Keypair } from "@stellar/stellar-sdk";

// Deterministic seed for a fixture account
function seed(n: number) {
  const buf = Buffer.alloc(32);
  buf.writeUInt32BE(n, 28);
  return Keypair.fromRawEd25519Seed(buf);
}

export const accountId = seed(1).publicKey();
export const missingAccountId = seed(2).publicKey();

export const accountResponse = {
  id: accountId,
  account_id: accountId,
  sequence: "18659541252046848",
  subentry_count: 0,
  last_modified_ledger: 4344513,
  last_modified_time: "2024-08-25T12:00:00Z",
  thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
  flags: { auth_required: false, auth_revocable: false, auth_immutable: false },
  balances: [],
  signers: [{ weight: 1, key: accountId, type: "ed25519_public_key" }],
  paging_token: accountId
};
