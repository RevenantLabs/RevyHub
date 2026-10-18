import { Keypair } from "@stellar/stellar-sdk";

/**
 * Addresses are derived from fixed raw seeds so every checksum is correct and
 * every run sees the same values. Snapshots are built from one base object and
 * edited a field at a time, so each fixture differs in exactly the one way its
 * name says.
 */
const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const account = seed(1).publicKey();
export const otherAccount = seed(2).publicKey();
export const usdcIssuer = seed(3).publicKey();
export const otherIssuer = seed(4).publicKey();
export const extraSigner = seed(5).publicKey();

export const POOL_ID = "a".repeat(64);

type Json = Record<string, unknown>;

/** A Horizon account resource, trimmed to the fields this tool compares. */
export const baseSnapshot: Json = {
  _links: { self: { href: "https://horizon.example/accounts" } },
  id: account,
  account_id: account,
  sequence: "4370426197114880",
  subentry_count: 3,
  last_modified_ledger: 51_000_000,
  num_sponsoring: 0,
  num_sponsored: 0,
  home_domain: "example.com",
  thresholds: { low_threshold: 0, med_threshold: 1, high_threshold: 2 },
  flags: {
    auth_required: false,
    auth_revocable: false,
    auth_immutable: false,
    auth_clawback_enabled: false
  },
  balances: [
    {
      balance: "100.5000000",
      buying_liabilities: "0.0000000",
      selling_liabilities: "0.0000000",
      asset_type: "native"
    },
    {
      balance: "250.0000000",
      limit: "1000.0000000",
      buying_liabilities: "0.0000000",
      selling_liabilities: "0.0000000",
      asset_type: "credit_alphanum4",
      asset_code: "USDC",
      asset_issuer: usdcIssuer,
      is_authorized: true
    }
  ],
  signers: [{ weight: 1, key: account, type: "ed25519_public_key" }],
  data: { "config.version": "MS40LjA=" }
};

const clone = (value: Json): Json => JSON.parse(JSON.stringify(value)) as Json;

export const json = (value: Json): string => JSON.stringify(value, null, 2);

export const baseJson = json(baseSnapshot);

/** The same snapshot with its balances and signers arrays reversed. */
export const reorderedJson = (() => {
  const snapshot = clone(baseSnapshot);
  snapshot.balances = (snapshot.balances as Json[]).slice().reverse();
  return json(snapshot);
})();

/** Only the XLM balance moved, by one stroop. */
export const oneStroopJson = (() => {
  const snapshot = clone(baseSnapshot);
  (snapshot.balances as Json[])[0].balance = "100.5000001";
  return json(snapshot);
})();

/** The USDC balance dropped by 50. */
export const balanceDownJson = (() => {
  const snapshot = clone(baseSnapshot);
  (snapshot.balances as Json[])[1].balance = "200.0000000";
  return json(snapshot);
})();

/** A second USDC-coded asset from a different issuer was added. */
export const sameCodeOtherIssuerJson = (() => {
  const snapshot = clone(baseSnapshot);
  (snapshot.balances as Json[]).push({
    balance: "7.0000000",
    limit: "1000.0000000",
    asset_type: "credit_alphanum4",
    asset_code: "USDC",
    asset_issuer: otherIssuer
  });
  return json(snapshot);
})();

/** The USDC trustline is gone entirely. */
export const trustlineRemovedJson = (() => {
  const snapshot = clone(baseSnapshot);
  snapshot.balances = [(snapshot.balances as Json[])[0]];
  return json(snapshot);
})();

/** The limit field disappeared — which is not the same as becoming zero. */
export const limitAbsentJson = (() => {
  const snapshot = clone(baseSnapshot);
  delete (snapshot.balances as Json[])[1].limit;
  return json(snapshot);
})();

/** The limit became an explicit zero. */
export const limitZeroJson = (() => {
  const snapshot = clone(baseSnapshot);
  (snapshot.balances as Json[])[1].limit = "0.0000000";
  return json(snapshot);
})();

/** A second signer was added and the thresholds were raised. */
export const signerAddedJson = (() => {
  const snapshot = clone(baseSnapshot);
  (snapshot.signers as Json[]).push({
    weight: 1,
    key: extraSigner,
    type: "ed25519_public_key"
  });
  snapshot.thresholds = { low_threshold: 0, med_threshold: 2, high_threshold: 2 };
  return json(snapshot);
})();

/** Balances beyond the safe integer range. */
export const HUGE_BEFORE = "9007199254740991.0000001";
export const HUGE_AFTER = "9007199254740991.0000002";

export const hugeBalanceBeforeJson = (() => {
  const snapshot = clone(baseSnapshot);
  (snapshot.balances as Json[])[0].balance = HUGE_BEFORE;
  return json(snapshot);
})();

export const hugeBalanceAfterJson = (() => {
  const snapshot = clone(baseSnapshot);
  (snapshot.balances as Json[])[0].balance = HUGE_AFTER;
  return json(snapshot);
})();

/** Pool shares, matched by pool ID rather than by any asset code. */
export const poolSharesJson = (() => {
  const snapshot = clone(baseSnapshot);
  (snapshot.balances as Json[]).push({
    balance: "12.0000000",
    liquidity_pool_id: POOL_ID,
    asset_type: "liquidity_pool_shares"
  });
  return json(snapshot);
})();

/** A field this tool does not model, to prove it is reported rather than hidden. */
export const unsupportedFieldJson = (() => {
  const snapshot = clone(baseSnapshot);
  snapshot.some_future_field = "surprise";
  return json(snapshot);
})();

/** The same shape, but a different account. */
export const otherAccountJson = (() => {
  const snapshot = clone(baseSnapshot);
  snapshot.account_id = otherAccount;
  snapshot.id = otherAccount;
  return json(snapshot);
})();

/** Valid JSON that is simply not an account resource. */
export const notAnAccountJson = json({ _embedded: { records: [] } });

/** An account_id that is not a valid Stellar public key. */
export const badAccountIdJson = json({ account_id: "not-a-key", balances: [] });

export const malformedJson = '{ "account_id": ';

/** Used only to prove a seed is refused and never echoed back. */
export const secretSeed = seed(1).secret();

export const snapshotWithSecretJson = json({
  ...baseSnapshot,
  home_domain: secretSeed
});
