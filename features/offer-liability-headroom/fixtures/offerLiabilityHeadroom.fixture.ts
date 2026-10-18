import { Keypair } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const accountId = seed(11).publicKey();
export const issuerId = seed(12).publicKey();
export const unknownAccountId = seed(13).publicKey();

export const accountResponse = {
  id: accountId,
  account_id: accountId,
  last_modified_ledger: 5000,
  balances: [
    {
      balance: "100.0000000",
      asset_type: "native",
      buying_liabilities: "0.0000000",
      selling_liabilities: "25.0000000"
    },
    {
      balance: "50.0000000",
      limit: "1000.0000000",
      asset_type: "credit_alphanum4",
      asset_code: "USDC",
      asset_issuer: issuerId,
      buying_liabilities: "5.0000000",
      selling_liabilities: "0.0000000",
      is_authorized: true
    }
  ]
};

export const offersResponse = {
  _embedded: {
    records: [
      {
        id: "1",
        amount: "25.0000000",
        price_r: { n: 1, d: 2 },
        last_modified_ledger: 4999,
        selling: { asset_type: "native" },
        buying: {
          asset_type: "credit_alphanum4",
          asset_code: "USDC",
          asset_issuer: issuerId
        }
      }
    ]
  }
};

export const offerLiabilityHeadroomFixture = {
  account: accountResponse,
  offers: offersResponse
};

/** Edge fixture: offer sells an asset with no matching balance row. */
export const unmatchedOffersFixture = {
  _embedded: {
    records: [
      {
        id: "9",
        amount: "1.0000000",
        price_r: { n: 1, d: 1 },
        last_modified_ledger: 5000,
        selling: {
          asset_type: "credit_alphanum4",
          asset_code: "EURC",
          asset_issuer: issuerId
        },
        buying: { asset_type: "native" }
      }
    ]
  }
};

export const skewedAccountResponse = {
  ...accountResponse,
  last_modified_ledger: 6000
};

export const skewedOffersResponse = {
  _embedded: {
    records: [
      {
        ...offersResponse._embedded.records[0],
        last_modified_ledger: 1000
      }
    ]
  }
};

export const malformedOffersResponse = {
  _embedded: {
    records: [{ id: "bad", amount: "x", selling: { asset_type: "native" } }]
  }
};
