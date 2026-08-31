import { Keypair } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const accountId = seed(31).publicKey();
export const unknownAccountId = seed(32).publicKey();
export const secretSeed = seed(33).secret();

export const textValue = "Hello, Stellar!";
export const textBase64 = Buffer.from(textValue, "utf8").toString("base64");
export const binaryBytes = Buffer.from([0x00, 0xff, 0x10, 0x7f]);
export const binaryBase64 = binaryBytes.toString("base64");
export const invalidBase64 = "%%%not-base64%%%";

/** A realistic Horizon `/accounts/{id}` payload, trimmed to the fields the SDK requires. */
export const accountResponse = {
  _links: { self: { href: "" } },
  id: accountId,
  account_id: accountId,
  sequence: "4370426197114881",
  subentry_count: 3,
  last_modified_ledger: 1017696,
  last_modified_time: "2026-05-02T10:14:05Z",
  thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
  flags: {
    auth_required: false,
    auth_revocable: false,
    auth_immutable: false,
    auth_clawback_enabled: false
  },
  balances: [],
  signers: [{ weight: 1, key: accountId, type: "ed25519_public_key" }],
  data: {
    binary: binaryBase64,
    broken: invalidBase64,
    greeting: textBase64
  },
  num_sponsoring: 0,
  num_sponsored: 0,
  paging_token: accountId
};

export const emptyDataResponse = { ...accountResponse, data: {} };
