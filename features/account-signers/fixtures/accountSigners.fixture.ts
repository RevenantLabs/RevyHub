import { Keypair, StrKey, xdr } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));
const bytes = (byte: number) => Buffer.alloc(32, byte);

export const accountId = seed(21).publicKey();
export const ed25519SignerKey = seed(22).publicKey();
export const normalAccountId = seed(23).publicKey();
export const unknownAccountId = seed(24).publicKey();
export const sha256SignerKey = StrKey.encodeSha256Hash(bytes(25));
export const preauthSignerKey = StrKey.encodePreAuthTx(bytes(26));

const signedPayload = new xdr.SignerKeyEd25519SignedPayload({
  ed25519: seed(27).rawPublicKey(),
  payload: Buffer.from("revyhub-fixture")
});

export const signedPayloadSignerKey = StrKey.encodeSignedPayload(signedPayload.toXDR());

const accountBase = {
  _links: { self: { href: "" } },
  sequence: "4370426197114881",
  subentry_count: 5,
  last_modified_ledger: 1017696,
  last_modified_time: "2026-05-02T10:14:05Z",
  flags: {
    auth_required: false,
    auth_revocable: false,
    auth_immutable: false,
    auth_clawback_enabled: false
  },
  balances: [
    {
      balance: "1250.5000000",
      asset_type: "native",
      buying_liabilities: "0.0000000",
      selling_liabilities: "0.0000000"
    }
  ],
  data: {},
  num_sponsoring: 0,
  num_sponsored: 0
};

/** Includes every signer type and an intentionally unreachable high threshold. */
export const accountResponse = {
  ...accountBase,
  id: accountId,
  account_id: accountId,
  paging_token: accountId,
  thresholds: { low_threshold: 1, med_threshold: 5, high_threshold: 11 },
  signers: [
    { weight: 0, key: accountId, type: "ed25519_public_key" },
    { weight: 2, key: ed25519SignerKey, type: "ed25519_public_key" },
    { weight: 3, key: sha256SignerKey, type: "sha256_hash" },
    { weight: 4, key: preauthSignerKey, type: "preauth_tx" },
    { weight: 1, key: signedPayloadSignerKey, type: "ed25519_signed_payload" }
  ]
};

/** Stellar's default funded-account authorization setup. */
export const normalAccountResponse = {
  ...accountBase,
  id: normalAccountId,
  account_id: normalAccountId,
  paging_token: normalAccountId,
  subentry_count: 0,
  thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
  signers: [{ weight: 1, key: normalAccountId, type: "ed25519_public_key" }]
};
