import { Keypair } from "@stellar/stellar-sdk";

export const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const accountId = seed(1).publicKey();
export const sponsorId = seed(2).publicKey();
export const sponsoredAccountId = seed(3).publicKey();

export const mockSponsoredAccount = {
  _links: { self: { href: "" } },
  id: accountId,
  account_id: accountId,
  sequence: "4370426197114881",
  subentry_count: 2,
  sponsor: sponsorId,
  thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
  flags: { auth_required: false, auth_revocable: false, auth_immutable: false, auth_clawback_enabled: false },
  balances: [
    { balance: "100.0000000", asset_type: "native", sponsor: sponsorId }
  ],
  signers: [
    { weight: 1, key: accountId, type: "ed25519_public_key" },
    { weight: 1, key: sponsorId, type: "ed25519_public_key", sponsor: sponsorId }
  ],
  data: {},
  num_sponsoring: 0,
  num_sponsored: 3,
  paging_token: accountId
};

export const mockSponsoringAccountsList = {
  _embedded: {
    records: [
      {
        _links: { self: { href: "" } },
        id: sponsoredAccountId,
        account_id: sponsoredAccountId,
        sequence: "4370426197114882",
        subentry_count: 2,
        sponsor: accountId,
        thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
        flags: { auth_required: false, auth_revocable: false, auth_immutable: false, auth_clawback_enabled: false },
        balances: [
          { balance: "50.0000000", asset_type: "native", sponsor: accountId }
        ],
        signers: [
          { weight: 1, key: sponsoredAccountId, type: "ed25519_public_key" },
          { weight: 1, key: accountId, type: "ed25519_public_key", sponsor: accountId }
        ],
        data: {},
        num_sponsoring: 0,
        num_sponsored: 3,
        paging_token: sponsoredAccountId
      }
    ]
  }
};
