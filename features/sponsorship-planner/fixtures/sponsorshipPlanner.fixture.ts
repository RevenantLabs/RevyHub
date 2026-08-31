import { Keypair } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const sponsorAccountId = seed(1).publicKey();
export const sponsoredAccountId = seed(2).publicKey();
export const existingSponsorId = seed(3).publicKey();
export const poorSponsorAccountId = seed(4).publicKey();
export const newSponsoredAccountId = seed(5).publicKey();
export const unknownSponsorAccountId = seed(6).publicKey();
export const issuerId = seed(7).publicKey();
export const additionalSignerId = seed(8).publicKey();
export const sponsoredSignerId = seed(9).publicKey();
export const secretSeed = seed(10).secret();

export const baseReserveStroops = 5_000_000;

/**
 * A healthy sponsor: balance 100 XLM, one sponsored trustline, one extra
 * signer and one data entry of its own, and two reserve units it already
 * sponsors for other accounts.
 */
export const sponsorAccountResponse = {
  account_id: sponsorAccountId,
  num_sponsoring: 2,
  num_sponsored: 1,
  subentry_count: 3,
  balances: [
    {
      balance: "100.0000000",
      asset_type: "native",
      buying_liabilities: "0.0000000",
      selling_liabilities: "0.0000000"
    },
    {
      balance: "0.0000000",
      limit: "1000.0000000",
      asset_type: "credit_alphanum4",
      asset_code: "USDC",
      asset_issuer: issuerId,
      sponsor: existingSponsorId
    }
  ],
  signers: [
    { weight: 1, key: sponsorAccountId, type: "ed25519_public_key" },
    { weight: 1, key: additionalSignerId, type: "ed25519_public_key" }
  ],
  data: { "kyc-status": Buffer.from("verified").toString("base64") }
};

/**
 * A sponsor too poor to cover the plan: 3 XLM against a resulting minimum of
 * 3.5 XLM, leaving an exact 0.5 XLM shortfall.
 */
export const poorSponsorAccountResponse = {
  account_id: poorSponsorAccountId,
  num_sponsoring: 0,
  num_sponsored: 0,
  subentry_count: 0,
  balances: [
    {
      balance: "3.0000000",
      asset_type: "native",
      buying_liabilities: "0.0000000",
      selling_liabilities: "0.0000000"
    }
  ],
  signers: [{ weight: 1, key: poorSponsorAccountId, type: "ed25519_public_key" }],
  data: {}
};

/**
 * An already-sponsored account with a mix: its entry, one trustline and one
 * signer are sponsored by `existingSponsor`; one trustline, one signer, one
 * data entry, one offer and one claimable balance remain unsponsored and are
 * what the plan would cover.
 */
export const sponsoredAccountResponse = {
  account_id: sponsoredAccountId,
  sponsor: existingSponsorId,
  num_sponsoring: 0,
  num_sponsored: 4,
  subentry_count: 7,
  balances: [
    {
      balance: "1.0000000",
      asset_type: "native",
      buying_liabilities: "0.0000000",
      selling_liabilities: "0.0000000"
    },
    {
      balance: "5.0000000",
      limit: "1000.0000000",
      asset_type: "credit_alphanum4",
      asset_code: "USDC",
      asset_issuer: issuerId,
      sponsor: existingSponsorId
    },
    {
      balance: "2.0000000",
      limit: "1000.0000000",
      asset_type: "credit_alphanum4",
      asset_code: "BTC",
      asset_issuer: issuerId
    }
  ],
  signers: [
    { weight: 1, key: sponsoredAccountId, type: "ed25519_public_key" },
    { weight: 1, key: sponsoredSignerId, type: "ed25519_public_key", sponsor: existingSponsorId },
    { weight: 1, key: additionalSignerId, type: "ed25519_public_key" }
  ],
  data: { "kyc-status": Buffer.from("verified").toString("base64") }
};

export const offersResponse = {
  _embedded: {
    records: [
      {
        id: "812345",
        paging_token: "812345",
        seller: sponsoredAccountId,
        amount: "10.0000000",
        selling: `XLM:native`,
        buying: `USDC:${issuerId}`
      }
    ]
  }
};

export const claimableBalancesResponse = {
  _embedded: {
    records: [
      {
        id: "c".repeat(64),
        paging_token: `1017696-${"c".repeat(64)}`,
        asset: `USDC:${issuerId}`,
        amount: "50.0000000",
        last_modified_ledger: 1017696,
        claimants: [
          { destination: sponsoredAccountId, predicate: { unconditional: true } }
        ]
      }
    ]
  }
};

/**
 * Deliberately no sponsorship effect for `kyc-status`: the data entry was
 * never sponsored, so the newest-first walk leaves it unsponsored and the plan
 * covers it.
 */
export const effectsResponse = {
  _embedded: {
    records: [{ id: "1", paging_token: "1", type: "account_credited" }]
  }
};

export const ledgerResponse = {
  _embedded: {
    records: [{ base_reserve_in_stroops: baseReserveStroops }]
  }
};

export const notFoundBody = {
  type: "https://stellar.org/horizon-errors/not_found",
  title: "Resource Missing",
  status: 404
};
