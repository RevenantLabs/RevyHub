import { Keypair } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const accountId = seed(11).publicKey();
export const sponsorA = seed(12).publicKey();
export const sponsorB = seed(13).publicKey();
export const issuerId = seed(14).publicKey();
export const signerId = seed(15).publicKey();
export const noRelationshipsAccountId = seed(16).publicKey();
export const unknownAccountId = seed(17).publicKey();
export const secretSeed = seed(18).secret();

/**
 * The reserve units add up on purpose: the sponsored account entry is worth
 * two, and the trustline, signer, offer and data entry one each, so
 * `num_sponsored` is 6 against 2 units sponsored for other accounts.
 */
export const accountResponse = {
  account_id: accountId,
  sponsor: sponsorA,
  num_sponsoring: 2,
  num_sponsored: 6,
  balances: [
    {
      balance: "25.0000000",
      asset_type: "native",
      buying_liabilities: "0.0000000",
      selling_liabilities: "0.0000000"
    },
    {
      balance: "40.0000000",
      limit: "922337203685.4775807",
      asset_type: "credit_alphanum4",
      asset_code: "USDC",
      asset_issuer: issuerId,
      sponsor: sponsorA
    }
  ],
  signers: [
    { weight: 1, key: accountId, type: "ed25519_public_key" },
    { weight: 1, key: signerId, type: "ed25519_public_key", sponsor: sponsorB }
  ],
  data: {
    "kyc-status": Buffer.from("verified").toString("base64")
  }
};

export const offersResponse = {
  _embedded: {
    records: [
      {
        id: "812345",
        paging_token: "812345",
        seller: accountId,
        amount: "10.0000000",
        sponsor: sponsorA
      }
    ]
  }
};

/** Horizon effects, newest first — the order the tool requests them in. */
export const effectsResponse = {
  _embedded: {
    records: [
      {
        id: "200-1",
        paging_token: "200-1",
        type: "data_sponsorship_updated",
        data_name: "kyc-status",
        former_sponsor: sponsorA,
        new_sponsor: sponsorB
      },
      {
        id: "100-1",
        paging_token: "100-1",
        type: "data_sponsorship_created",
        data_name: "kyc-status",
        sponsor: sponsorA
      }
    ]
  }
};

export const ledgerResponse = {
  _embedded: {
    records: [{ base_reserve_in_stroops: 5_000_000 }]
  }
};

/**
 * Keeps a data entry so the test proves the offer and effect requests are
 * skipped because `num_sponsored` is zero, not because there is nothing to read.
 */
export const noRelationshipsAccountResponse = {
  ...accountResponse,
  account_id: noRelationshipsAccountId,
  sponsor: undefined,
  num_sponsoring: 0,
  num_sponsored: 0,
  balances: [accountResponse.balances[0]],
  signers: [{ weight: 1, key: noRelationshipsAccountId, type: "ed25519_public_key" }]
};
