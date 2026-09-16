/**
 * Typed test fixtures for Horizon and Friendbot responses.
 * All account keys are synthetic — no real user data is present.
 */

// ---------------------------------------------------------------------------
// Canonical synthetic addresses used across all fixtures
// ---------------------------------------------------------------------------

export const FIXTURE_ACCOUNT_ID =
  "GBXGQJWVLWOYHFLXET3HBMCWXQTJNRMPKIPKQ24DRTDHSYOQVWKGRXQ";

export const FIXTURE_ISSUER_ID =
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

export const FIXTURE_TX_HASH =
  "3389e9f0f1a65f19736cacf544c2e825313e8447f569233bb8db39aa607c8889";

// ---------------------------------------------------------------------------
// Account fixture
// ---------------------------------------------------------------------------

export interface FixtureBalance {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  balance: string;
  limit?: string;
  buying_liabilities?: string;
  selling_liabilities?: string;
  liquidity_pool_id?: string;
}

export interface FixtureAccount {
  id: string;
  account_id: string;
  sequence: string;
  subentry_count: number;
  balances: FixtureBalance[];
  thresholds: { low_threshold: number; med_threshold: number; high_threshold: number };
  flags: { auth_required: boolean; auth_revocable: boolean; auth_immutable: boolean };
  signers: Array<{ weight: number; key: string; type: string }>;
  data: Record<string, string>;
  last_modified_ledger: number;
  _links: Record<string, { href: string }>;
}

export const accountFixture: FixtureAccount = {
  id: FIXTURE_ACCOUNT_ID,
  account_id: FIXTURE_ACCOUNT_ID,
  sequence: "3397699588247552",
  subentry_count: 1,
  last_modified_ledger: 45000,
  thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
  flags: { auth_required: false, auth_revocable: false, auth_immutable: false },
  balances: [
    {
      asset_type: "credit_alphanum4",
      asset_code: "USDC",
      asset_issuer: FIXTURE_ISSUER_ID,
      balance: "10.0000000",
      limit: "922337203685.4775807",
      buying_liabilities: "0.0000000",
      selling_liabilities: "0.0000000"
    },
    {
      asset_type: "native",
      balance: "9999.9999600",
      buying_liabilities: "0.0000000",
      selling_liabilities: "0.0000000"
    }
  ],
  signers: [{ weight: 1, key: FIXTURE_ACCOUNT_ID, type: "ed25519_public_key" }],
  data: {},
  _links: {
    self: { href: `https://horizon-testnet.stellar.org/accounts/${FIXTURE_ACCOUNT_ID}` },
    transactions: {
      href: `https://horizon-testnet.stellar.org/accounts/${FIXTURE_ACCOUNT_ID}/transactions{?cursor,limit,order}`,
    },
    operations: {
      href: `https://horizon-testnet.stellar.org/accounts/${FIXTURE_ACCOUNT_ID}/operations{?cursor,limit,order}`,
    }
  }
};

// ---------------------------------------------------------------------------
// Transaction fixture
// ---------------------------------------------------------------------------

export interface FixtureTransaction {
  id: string;
  hash: string;
  ledger: number;
  created_at: string;
  source_account: string;
  source_account_sequence: string;
  fee_account: string;
  fee_charged: string;
  max_fee: string;
  operation_count: number;
  envelope_xdr: string;
  result_xdr: string;
  result_meta_xdr: string;
  memo_type: string;
  memo?: string;
  signatures: string[];
  successful: boolean;
  _links: Record<string, { href: string }>;
}

export const transactionFixture: FixtureTransaction = {
  id: FIXTURE_TX_HASH,
  hash: FIXTURE_TX_HASH,
  ledger: 45001,
  created_at: "2024-01-15T10:30:00Z",
  source_account: FIXTURE_ACCOUNT_ID,
  source_account_sequence: "3397699588247553",
  fee_account: FIXTURE_ACCOUNT_ID,
  fee_charged: "100",
  max_fee: "100",
  operation_count: 1,
  envelope_xdr: "AAAAAQ==",
  result_xdr: "AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAABAAAAAAAAAAA=",
  result_meta_xdr: "AAAAAQ==",
  memo_type: "text",
  memo: "test payment",
  signatures: ["signature_placeholder"],
  successful: true,
  _links: {
    self: { href: `https://horizon-testnet.stellar.org/transactions/${FIXTURE_TX_HASH}` },
    account: { href: `https://horizon-testnet.stellar.org/accounts/${FIXTURE_ACCOUNT_ID}` },
    ledger: { href: `https://horizon-testnet.stellar.org/ledgers/45001` },
    operations: {
      href: `https://horizon-testnet.stellar.org/transactions/${FIXTURE_TX_HASH}/operations`
    }
  }
};

// ---------------------------------------------------------------------------
// Fee stats fixture
// ---------------------------------------------------------------------------

export interface FixtureFeeStats {
  last_ledger: string;
  last_ledger_base_fee: string;
  ledger_capacity_usage: string;
  fee_charged: {
    max: string;
    min: string;
    mode: string;
    p10: string;
    p20: string;
    p30: string;
    p40: string;
    p50: string;
    p60: string;
    p70: string;
    p80: string;
    p90: string;
    p95: string;
    p99: string;
  };
  max_fee: {
    max: string;
    min: string;
    mode: string;
    p10: string;
    p20: string;
    p30: string;
    p40: string;
    p50: string;
    p60: string;
    p70: string;
    p80: string;
    p90: string;
    p95: string;
    p99: string;
  };
}

export const feeStatsFixture: FixtureFeeStats = {
  last_ledger: "45000",
  last_ledger_base_fee: "100",
  ledger_capacity_usage: "0.05",
  fee_charged: {
    max: "100",
    min: "100",
    mode: "100",
    p10: "100",
    p20: "100",
    p30: "100",
    p40: "100",
    p50: "100",
    p60: "100",
    p70: "100",
    p80: "100",
    p90: "100",
    p95: "100",
    p99: "100"
  },
  max_fee: {
    max: "100",
    min: "100",
    mode: "100",
    p10: "100",
    p20: "100",
    p30: "100",
    p40: "100",
    p50: "100",
    p60: "100",
    p70: "100",
    p80: "100",
    p90: "100",
    p95: "100",
    p99: "100"
  }
};

// ---------------------------------------------------------------------------
// Friendbot fixture
// ---------------------------------------------------------------------------

export interface FixtureFriendbotSuccess {
  hash: string;
  ledger: number;
  envelope_xdr: string;
  result_xdr: string;
  result_meta_xdr: string;
}

export const friendbotSuccessFixture: FixtureFriendbotSuccess = {
  hash: "friendbot_tx_" + "a".repeat(51),
  ledger: 45002,
  envelope_xdr: "AAAAAQ==",
  result_xdr: "AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAABAAAAAAAAAAA=",
  result_meta_xdr: "AAAAAQ=="
};

// ---------------------------------------------------------------------------
// Standard Horizon error shapes
// ---------------------------------------------------------------------------

export interface HorizonErrorBody {
  type: string;
  title: string;
  status: number;
  detail: string;
  extras?: Record<string, unknown>;
}

export const notFoundError: HorizonErrorBody = {
  type: "https://stellar.org/horizon-errors/not_found",
  title: "Resource Missing",
  status: 404,
  detail: "The resource at the url requested was not found."
};

export const rateLimitError: HorizonErrorBody = {
  type: "https://stellar.org/horizon-errors/too_many_requests",
  title: "Too Many Requests",
  status: 429,
  detail: "An excessive number of requests was made."
};

export const internalServerError: HorizonErrorBody = {
  type: "https://stellar.org/horizon-errors/server_error",
  title: "Internal Server Error",
  status: 500,
  detail: "An unexpected condition was encountered."
};

export const friendbotAlreadyFundedError: HorizonErrorBody = {
  type: "https://stellar.org/horizon-errors/transaction_failed",
  title: "Transaction Failed",
  status: 400,
  detail: "The transaction failed when submitted to the stellar network.",
  extras: {
    result_codes: {
      transaction: "tx_failed",
      operations: ["op_already_exists"]
    }
  }
};
