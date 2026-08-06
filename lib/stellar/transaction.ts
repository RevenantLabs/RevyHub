import {
  getHorizonServer,
  isCancelledError,
  isTimeoutError,
  runHorizonRequest,
  STELLAR_NETWORK,
  type StellarNetwork
} from "@/lib/stellar/horizon";
import { getResponseStatus } from "@/lib/stellar/account";
import type { TransactionSummary } from "@/components/stellar/TransactionDetails";

/** Normalised operation record shown in the transaction detail panel. */
export interface NormalizedOperation {
  id: string;
  type: string;
  typeLabel: string;
  sourceAccount: string;
  createdAt: string;
  transactionHash: string;
  amount?: string;
  from?: string;
  to?: string;
  account?: string;
  funder?: string;
  startingBalance?: string;
  assetCode?: string;
  assetIssuer?: string;
  assetType?: string;
  offerId?: number;
  price?: string;
  limit?: string;
  dataName?: string;
  dataValue?: string;
  into?: string;
  balanceId?: string;
  claimant?: string;
  bumpTo?: string;
}

const OPERATION_TYPE_LABELS: Record<string, string> = {
  create_account: "Create Account",
  payment: "Payment",
  path_payment_strict_receive: "Path Payment (Receive)",
  path_payment_strict_send: "Path Payment (Send)",
  manage_buy_offer: "Manage Buy Offer",
  manage_sell_offer: "Manage Sell Offer",
  create_passive_sell_offer: "Create Passive Offer",
  set_options: "Set Options",
  change_trust: "Change Trust",
  allow_trust: "Allow Trust",
  account_merge: "Account Merge",
  manage_data: "Manage Data",
  bump_sequence: "Bump Sequence",
  claim_claimable_balance: "Claim Claimable Balance",
  begin_sponsoring_future_reserves: "Begin Sponsoring",
  end_sponsoring_future_reserves: "End Sponsoring",
  revoke_sponsorship: "Revoke Sponsorship",
  clawback: "Clawback",
  clawback_claimable_balance: "Clawback Claimable Balance",
  set_trust_line_flags: "Set Trust Line Flags",
  liquidity_pool_deposit: "Liquidity Pool Deposit",
  liquidity_pool_withdraw: "Liquidity Pool Withdraw",
  extend_footprint_ttl: "Extend Footprint TTL",
  restore_footprint: "Restore Footprint",
};

function getTypeLabel(type: string): string {
  return OPERATION_TYPE_LABELS[type] ?? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeOperation(raw: any): NormalizedOperation {
  const op: NormalizedOperation = {
    id: String(raw.id ?? ""),
    type: String(raw.type ?? ""),
    typeLabel: getTypeLabel(String(raw.type ?? "")),
    sourceAccount: String(raw.source_account ?? ""),
    createdAt: String(raw.created_at ?? ""),
    transactionHash: String(raw.transaction_hash ?? ""),
  };

  // Type-specific fields
  const data = raw as Record<string, unknown>;

  if (raw.type === "create_account") {
    op.account = String(data.account ?? "");
    op.funder = String(data.funder ?? "");
    op.startingBalance = String(data.starting_balance ?? "");
  } else if (raw.type === "payment" || raw.type === "path_payment_strict_receive" || raw.type === "path_payment_strict_send") {
    op.from = String(data.from ?? "");
    op.to = String(data.to ?? "");
    op.amount = String(data.amount ?? "");
    op.assetType = String(data.asset_type ?? "");
    op.assetCode = String(data.asset_code ?? "");
    op.assetIssuer = String(data.asset_issuer ?? "");
  } else if (raw.type === "manage_buy_offer" || raw.type === "manage_sell_offer" || raw.type === "create_passive_sell_offer") {
    op.amount = String(data.amount ?? "");
    op.price = String(data.price ?? "");
    op.offerId = Number(data.offer_id) || undefined;
  } else if (raw.type === "change_trust") {
    op.assetCode = String(data.asset_code ?? "");
    op.assetIssuer = String(data.asset_issuer ?? "");
    op.limit = String(data.limit ?? "");
  } else if (raw.type === "manage_data") {
    op.dataName = String(data.data_name ?? "");
    op.dataValue = String(data.data_value ?? "");
  } else if (raw.type === "account_merge") {
    op.account = String(data.account ?? "");
    op.into = String(data.into ?? "");
  } else if (raw.type === "bump_sequence") {
    op.bumpTo = String(data.bump_to ?? "");
  } else if (raw.type === "claim_claimable_balance") {
    op.balanceId = String(data.balance_id ?? "");
    op.claimant = String(data.claimant ?? "");
  } else if (raw.type === "clawback") {
    op.from = String(data.from ?? "");
    op.amount = String(data.amount ?? "");
    op.assetCode = String(data.asset_code ?? "");
  }

  return op;
}

/** Result of a full transaction lookup: the summary plus its operations. */
export interface TransactionLookupResult {
  summary: TransactionSummary;
  /** Null when Horizon could not be reached for the operation list. */
  operations: NormalizedOperation[] | null;
}

/** Fetch the list of operations belonging to a transaction. */
export async function fetchTransactionOperations(
  hash: string,
  network: StellarNetwork = STELLAR_NETWORK,
  signal?: AbortSignal
): Promise<NormalizedOperation[]> {
  try {
    const server = getHorizonServer(network);
    const operationsPage = await runHorizonRequest(
      server.operations().forTransaction(hash.trim()).call(),
      { signal }
    );
    return operationsPage.records.map((record) => normalizeOperation(record));
  } catch (error) {
    if (isCancelledError(error)) {
      throw error;
    }

    throw new Error("Could not load operations from Horizon. Try again in a moment.");
  }
}

export function isLikelyTransactionHash(value: string) {
  return /^[a-fA-F0-9]{64}$/.test(value.trim());
}

export async function lookupTransaction(
  hash: string,
  network: StellarNetwork = STELLAR_NETWORK,
  signal?: AbortSignal
): Promise<TransactionLookupResult> {
  if (!hash.trim()) {
    throw new Error("Enter a transaction hash.");
  }

  if (!isLikelyTransactionHash(hash)) {
    throw new Error("Transaction hashes are 64 hexadecimal characters.");
  }

  try {
    const server = getHorizonServer(network);
    const transaction = await runHorizonRequest(
      server.transactions().transaction(hash.trim()).call(),
      { signal }
    );

    const summary: TransactionSummary = {
      hash: transaction.hash,
      ledger: transaction.ledger_attr,
      sourceAccount: transaction.source_account,
      feeCharged: String(transaction.fee_charged),
      createdAt: transaction.created_at,
      successful: transaction.successful,
      network,
      operationCount: transaction.operation_count,
      memo:
        transaction.memo_type !== "none"
          ? { type: transaction.memo_type, value: transaction.memo ?? "" }
          : undefined
    };

    // The summary is the primary result; a failed operation fetch must not hide
    // it. Cancellation still propagates so the caller can abort cleanly.
    let operations: NormalizedOperation[] | null = null;
    try {
      operations = await fetchTransactionOperations(hash, network, signal);
    } catch (error) {
      if (isCancelledError(error)) {
        throw error;
      }
    }

    return { summary, operations };
  } catch (error) {
    if (isCancelledError(error)) {
      throw error;
    }

    if (isTimeoutError(error)) {
      throw new Error("The Horizon transaction request timed out. Try again.");
    }

    if (getResponseStatus(error) === 404) {
      throw new Error(`Transaction not found on Stellar ${network}.`);
    }

    throw new Error("Could not load transaction from Horizon. Try again in a moment.");
  }
}
