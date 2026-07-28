import { randomUUID } from "node:crypto";
import { Keypair } from "@stellar/stellar-sdk";

/* ------------------------------------------------------------------ */
/*  Horizon Account response fixture                                  */
/* ------------------------------------------------------------------ */

export interface BalanceNative {
  balance: string;
  buying_liabilities: string;
  selling_liabilities: string;
  asset_type: "native";
}

export interface BalanceIssued {
  balance: string;
  buying_liabilities: string;
  selling_liabilities: string;
  asset_type: "credit_alphanum4" | "credit_alphanum12";
  asset_code: string;
  asset_issuer: string;
}

export interface BalanceLiquidityPool {
  balance: string;
  buying_liabilities: string;
  selling_liabilities: string;
  asset_type: "liquidity_pool_shares";
  liquidity_pool_id: string;
}

export type Balance = BalanceNative | BalanceIssued | BalanceLiquidityPool;

export interface AccountRecord {
  _links: Record<string, { href: string; templated?: boolean }>;
  id: string;
  account_id: string;
  sequence: string;
  sequence_ledger: number | null;
  sequence_time: number | null;
  subentry_count: number;
  inflation_destination: string | null;
  home_domain: string | null;
  last_modified_ledger: number;
  last_modified_time: string;
  thresholds: {
    low_threshold: number;
    med_threshold: number;
    high_threshold: number;
  };
  flags: {
    auth_required: boolean;
    auth_revocable: boolean;
    auth_immutable: boolean;
  };
  balances: Balance[];
  signers: Array<{ weight: number; key: string; type: string }>;
  data: Record<string, string>;
  num_sponsored: number;
  num_sponsoring: number;
  sponsoring: string | null;
}

export function createAccountFixture(overrides?: Partial<AccountRecord>): AccountRecord {
  const key = Keypair.random().publicKey();
  const horizonUrl = "https://horizon-testnet.stellar.org";

  return {
    _links: {
      self: { href: `${horizonUrl}/accounts/${key}` },
      transactions: {
        href: `${horizonUrl}/accounts/${key}/transactions{?cursor,limit,order}`,
        templated: true
      },
      operations: {
        href: `${horizonUrl}/accounts/${key}/operations{?cursor,limit,order}`,
        templated: true
      },
      payments: {
        href: `${horizonUrl}/accounts/${key}/payments{?cursor,limit,order}`,
        templated: true
      },
      effects: {
        href: `${horizonUrl}/accounts/${key}/effects{?cursor,limit,order}`,
        templated: true
      },
      offers: {
        href: `${horizonUrl}/accounts/${key}/offers{?cursor,limit,order}`,
        templated: true
      },
      trades: {
        href: `${horizonUrl}/accounts/${key}/trades{?cursor,limit,order}`,
        templated: true
      },
      data: {
        href: `${horizonUrl}/accounts/${key}/data/{key}`,
        templated: true
      }
    },
    id: key,
    account_id: key,
    sequence: "123456789",
    sequence_ledger: null,
    sequence_time: null,
    subentry_count: 0,
    inflation_destination: null,
    home_domain: null,
    last_modified_ledger: 12345,
    last_modified_time: "2024-06-01T12:00:00Z",
    thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
    flags: { auth_required: false, auth_revocable: false, auth_immutable: false },
    balances: [
      {
        balance: "10000.0000000",
        buying_liabilities: "0.0000000",
        selling_liabilities: "0.0000000",
        asset_type: "native" as const
      }
    ],
    signers: [{ weight: 1, key, type: "ed25519_public_key" }],
    data: {},
    num_sponsored: 0,
    num_sponsoring: 0,
    sponsoring: null,
    ...overrides
  };
}

// Pre-built account with an issued asset trustline
export function accountWithTrustline(assetCode = "USDC", assetIssuer?: string): AccountRecord {
  const issuer = assetIssuer ?? Keypair.random().publicKey();
  return createAccountFixture({
    balances: [
      {
        balance: "10000.0000000",
        buying_liabilities: "0.0000000",
        selling_liabilities: "0.0000000",
        asset_type: "native" as const
      },
      {
        balance: "500.0000000",
        buying_liabilities: "0.0000000",
        selling_liabilities: "0.0000000",
        asset_type: "credit_alphanum4" as const,
        asset_code: assetCode,
        asset_issuer: issuer
      }
    ]
  });
}

/* ------------------------------------------------------------------ */
/*  Horizon Transaction response fixture                              */
/* ------------------------------------------------------------------ */

export interface TransactionRecord {
  _links: Record<string, { href: string; templated?: boolean }>;
  id: string;
  paging_token: string;
  successful: boolean;
  hash: string;
  ledger: number;
  created_at: string;
  source_account: string;
  source_account_sequence: string;
  fee_account: string;
  fee_source_account: string | null;
  max_fee: number;
  fee_charged: number;
  operation_count: number;
  envelope_xdr: string;
  result_xdr: string;
  result_meta_xdr: string;
  fee_meta_xdr: string;
  memo_type: string;
  memo: string | null;
  signatures: string[];
  valid_after: string | null;
  valid_before: string | null;
}

export function createTransactionFixture(
  overrides?: Partial<TransactionRecord>
): TransactionRecord {
  const hash = "abc" + "d".repeat(61);
  const source = Keypair.random().publicKey();
  const horizonUrl = "https://horizon-testnet.stellar.org";

  return {
    _links: {
      self: { href: `${horizonUrl}/transactions/${hash}` },
      account: { href: `${horizonUrl}/accounts/${source}` },
      ledger: { href: `${horizonUrl}/ledgers/12345` },
      operations: {
        href: `${horizonUrl}/transactions/${hash}/operations{?cursor,limit,order}`,
        templated: true
      },
      effects: {
        href: `${horizonUrl}/transactions/${hash}/effects{?cursor,limit,order}`,
        templated: true
      },
      precedes: { href: `${horizonUrl}/transactions?order=asc&cursor=12345` },
      succeeds: { href: `${horizonUrl}/transactions?order=desc&cursor=12345` }
    },
    id: hash,
    paging_token: "12345",
    successful: true,
    hash,
    ledger: 12345,
    created_at: "2024-06-01T12:00:00Z",
    source_account: source,
    source_account_sequence: "123",
    fee_account: source,
    fee_source_account: null,
    max_fee: 100,
    fee_charged: 100,
    operation_count: 2,
    envelope_xdr: "AAAAA...",
    result_xdr: "AAAAA...",
    result_meta_xdr: "AAAAA...",
    fee_meta_xdr: "AAAAA...",
    memo_type: "none",
    memo: null,
    signatures: ["SIGNATURE..."],
    valid_after: null,
    valid_before: null,
    ...overrides
  };
}

/* ------------------------------------------------------------------ */
/*  Horizon Fee response fixture                                      */
/* ------------------------------------------------------------------ */

export interface FeeRecord {
  last_ledger: string;
  last_ledger_base_fee: number;
  fee_charged: {
    max: number;
    min: number;
    mode: number;
    p10: number;
    p20: number;
    p30: number;
    p40: number;
    p50: number;
    p60: number;
    p70: number;
    p80: number;
    p90: number;
    p95: number;
    p99: number;
  };
}

export function createFeeFixture(overrides?: Partial<FeeRecord>): FeeRecord {
  return {
    last_ledger: "12345",
    last_ledger_base_fee: 100,
    fee_charged: {
      max: 1000,
      min: 100,
      mode: 100,
      p10: 100,
      p20: 100,
      p30: 100,
      p40: 100,
      p50: 100,
      p60: 100,
      p70: 100,
      p80: 100,
      p90: 100,
      p95: 500,
      p99: 1000
    },
    ...overrides
  };
}

/* ------------------------------------------------------------------ */
/*  Horizon error response fixture                                    */
/* ------------------------------------------------------------------ */

export interface HorizonErrorRecord {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  result_xdr?: string;
}

export function createErrorFixture(
  status: number,
  detail?: string
): HorizonErrorRecord {
  const titles: Record<number, string> = {
    400: "Bad Request",
    404: "Resource Missing",
    429: "Rate Limit Exceeded",
    500: "Internal Server Error"
  };

  return {
    type: `https://stellar.org/horizon-errors/${status}`,
    title: titles[status] ?? "Unknown Error",
    status,
    detail: detail ?? `Horizon returned an error response (${status}).`,
    instance: `urn:uuid:${randomUUID()}`
  };
}

/* ------------------------------------------------------------------ */
/*  Friendbot response fixture                                        */
/* ------------------------------------------------------------------ */

export interface FriendbotSuccessRecord {
  hash: string;
  _links: Record<string, { href: string }>;
  latestLedger: number;
  latestLedgerCloseTime: string;
  pagingToken: string;
}

export function createFriendbotSuccessFixture(): FriendbotSuccessRecord {
  const hash = "abc" + "d".repeat(61);

  return {
    _links: {
      transaction: { href: `https://horizon-testnet.stellar.org/transactions/${hash}` }
    },
    hash,
    latestLedger: 12346,
    latestLedgerCloseTime: "2024-06-01T12:00:05Z",
    pagingToken: "12346"
  };
}
