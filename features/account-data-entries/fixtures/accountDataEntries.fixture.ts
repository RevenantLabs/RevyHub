import { Keypair } from "@stellar/stellar-sdk";
import type { AccountDataEntriesResult } from "@/features/account-data-entries/types";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const accountId = seed(1).publicKey();
export const emptyAccountId = seed(2).publicKey();
export const unknownAccountId = seed(3).publicKey();
export const secretSeed = seed(4).secret();

export const textEntryKey = "memo";
export const binaryEntryKey = "nonce";
export const brokenEntryKey = "corrupted";

export const textBase64 = Buffer.from("verified").toString("base64");
export const binaryBase64 = Buffer.from([0, 255, 16]).toString("base64");
export const brokenBase64 = "not-base64!";

export const accountResponse = {
  _links: { self: { href: "" } },
  id: accountId,
  account_id: accountId,
  sequence: "4370426197114881",
  subentry_count: 0,
  last_modified_ledger: 1017696,
  last_modified_time: "2026-05-02T10:14:05Z",
  thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
  flags: {
    auth_required: false,
    auth_revocable: false,
    auth_immutable: false,
    auth_clawback_enabled: false
  },
  balances: [
    {
      balance: "10.0000000",
      asset_type: "native",
      buying_liabilities: "0.0000000",
      selling_liabilities: "0.0000000"
    }
  ],
  signers: [{ weight: 1, key: accountId, type: "ed25519_public_key" }],
  data: {
    [brokenEntryKey]: brokenBase64,
    [textEntryKey]: textBase64,
    [binaryEntryKey]: binaryBase64
  },
  num_sponsoring: 0,
  num_sponsored: 0,
  paging_token: accountId
};

export const emptyAccountResponse = {
  ...accountResponse,
  id: emptyAccountId,
  account_id: emptyAccountId,
  data: {},
  paging_token: emptyAccountId
};

export const accountDataEntriesFixture: AccountDataEntriesResult = {
  accountId,
  entries: [
    {
      key: brokenEntryKey,
      rawBase64: brokenBase64,
      value: { kind: "invalid_base64" }
    },
    {
      key: textEntryKey,
      rawBase64: textBase64,
      value: { kind: "text", text: "verified", byteLength: 8 }
    },
    {
      key: binaryEntryKey,
      rawBase64: binaryBase64,
      value: { kind: "bytes", hex: "00ff10", byteLength: 3 }
    }
  ]
};
