import { Keypair } from "@stellar/stellar-sdk";
import type {
  DisplayOffer,
  OfferInspectorResult
} from "@/features/offer-inspector/types";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const accountId = seed(31).publicKey();
export const unknownAccountId = seed(32).publicKey();
export const emptyOffersAccountId = seed(33).publicKey();
export const issuerId = seed(34).publicKey();
export const sponsorId = seed(35).publicKey();

export const accountResponse = {
  _links: { self: { href: "" } },
  id: accountId,
  account_id: accountId,
  sequence: "5302428712241721",
  subentry_count: 2,
  last_modified_ledger: 1_234_560,
  last_modified_time: "2026-08-20T10:14:05Z",
  thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
  flags: {
    auth_required: false,
    auth_revocable: false,
    auth_immutable: false,
    auth_clawback_enabled: false
  },
  balances: [
    {
      balance: "100.0000000",
      asset_type: "native",
      buying_liabilities: "0.0000000",
      selling_liabilities: "50.0000000"
    }
  ],
  signers: [{ weight: 1, key: accountId, type: "ed25519_public_key" }],
  data: {},
  num_sponsoring: 0,
  num_sponsored: 0,
  paging_token: accountId
};

export const emptyOffersAccountResponse = {
  ...accountResponse,
  id: emptyOffersAccountId,
  account_id: emptyOffersAccountId,
  subentry_count: 0
};

export const ledgerSequence = 1_234_567;
export const baseReserveStroops = 5_000_000;
export const ledgerResponse = {
  _links: {
    self: { href: "" },
    next: { href: "" },
    prev: { href: "" }
  },
  _embedded: {
    records: [
      {
        _links: { self: { href: "" } },
        id: "a".repeat(64),
        paging_token: String(ledgerSequence),
        hash: "a".repeat(64),
        prev_hash: "b".repeat(64),
        sequence: ledgerSequence,
        successful_transaction_count: 1,
        failed_transaction_count: 0,
        operation_count: 1,
        tx_set_operation_count: 1,
        closed_at: "2026-08-20T10:15:00Z",
        total_coins: "105000000000.0000000",
        fee_pool: "1.0000000",
        max_tx_set_size: 1000,
        protocol_version: 23,
        header_xdr: "",
        base_fee_in_stroops: 100,
        base_reserve_in_stroops: baseReserveStroops
      }
    ]
  }
};

export const rawOfferRecord1 = {
  id: "20001",
  paging_token: "20001",
  seller: accountId,
  selling: { asset_type: "native" },
  buying: {
    asset_type: "credit_alphanum4",
    asset_code: "USDC",
    asset_issuer: issuerId
  },
  amount: "100.0000000",
  price_r: { n: 1, d: 2 },
  price: "0.5000000",
  last_modified_ledger: 1_234_560,
  last_modified_time: "2026-08-20T10:14:05Z",
  sponsor: undefined
};

export const rawOfferRecord2 = {
  id: "20002",
  paging_token: "20002",
  seller: accountId,
  selling: {
    asset_type: "credit_alphanum4",
    asset_code: "USDC",
    asset_issuer: issuerId
  },
  buying: { asset_type: "native" },
  amount: "50.0000000",
  price_r: { n: 2, d: 1 },
  price: "2.0000000",
  last_modified_ledger: 1_234_561,
  last_modified_time: "2026-08-20T10:14:10Z",
  sponsor: sponsorId
};

export const offersResponse = {
  _links: {
    self: { href: "" },
    next: { href: "" },
    prev: { href: "" }
  },
  _embedded: {
    records: [rawOfferRecord1, rawOfferRecord2]
  }
};

export const emptyOffersResponse = {
  _links: {
    self: { href: "" },
    next: { href: "" },
    prev: { href: "" }
  },
  _embedded: {
    records: []
  }
};

export const pageOneOffersResponse = {
  _links: {
    self: { href: "" },
    next: { href: "https://horizon-testnet.stellar.org/accounts/" + accountId + "/offers?cursor=20001" },
    prev: { href: "" }
  },
  _embedded: {
    records: [rawOfferRecord1]
  }
};

export const pageTwoOffersResponse = {
  _links: {
    self: { href: "" },
    next: { href: "" },
    prev: { href: "" }
  },
  _embedded: {
    records: [rawOfferRecord2]
  }
};

export const displayOffer1: DisplayOffer = {
  id: "20001",
  pagingToken: "20001",
  seller: accountId,
  selling: { isNative: true, code: "XLM", label: "XLM (native)" },
  buying: { isNative: false, code: "USDC", issuer: issuerId, label: `USDC:${issuerId}` },
  amount: "100.0000000",
  price: "0.5000000",
  priceFraction: { n: 1, d: 2 },
  lastModifiedLedger: 1_234_560,
  lastModifiedTime: "2026-08-20T10:14:05Z",
  sponsor: undefined
};

export const displayOffer2: DisplayOffer = {
  id: "20002",
  pagingToken: "20002",
  seller: accountId,
  selling: { isNative: false, code: "USDC", issuer: issuerId, label: `USDC:${issuerId}` },
  buying: { isNative: true, code: "XLM", label: "XLM (native)" },
  amount: "50.0000000",
  price: "2.0000000",
  priceFraction: { n: 2, d: 1 },
  lastModifiedLedger: 1_234_561,
  lastModifiedTime: "2026-08-20T10:14:10Z",
  sponsor: sponsorId
};

export const offerInspectorFixture: OfferInspectorResult = {
  accountId,
  offers: [displayOffer1, displayOffer2],
  latestLedgerSequence: ledgerSequence,
  baseReserveInStroops: baseReserveStroops,
  baseReserveXlm: "0.5",
  loadedOffersCount: 2,
  grossReserveUnits: 2,
  grossReserveStroops: "10000000",
  grossReserveXlm: "1",
  isPartial: false,
  nextCursor: undefined,
  network: "testnet"
};


