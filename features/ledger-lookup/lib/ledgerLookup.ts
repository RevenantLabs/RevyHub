import { err, ok, type Result } from "@/core/result/result";
import { horizonServer } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import type { Horizon } from "@stellar/stellar-sdk";
import { toLedgerLookupErrorCode } from "@/features/ledger-lookup/lib/ledgerLookup.errors";
import type {
  LedgerErrorCode,
  LedgerErrorDetail,
  LedgerInput,
  LedgerSummary
} from "@/features/ledger-lookup/types";

/** Normalizes a Horizon LedgerRecord into the display summary model. */
export function normalizeLedger(record: Horizon.ServerApi.LedgerRecord): LedgerSummary {
  return {
    sequence: record.sequence,
    hash: record.hash,
    prevHash: record.prev_hash,
    closedAt: record.closed_at,
    successfulTransactionCount: record.successful_transaction_count ?? 0,
    failedTransactionCount: record.failed_transaction_count ?? 0,
    operationCount: record.operation_count ?? 0,
    txSetOperationCount: record.tx_set_operation_count ?? null,
    totalCoins: String(record.total_coins),
    feePool: String(record.fee_pool),
    baseFeeInStroops: record.base_fee_in_stroops,
    baseReserveInStroops: record.base_reserve_in_stroops,
    maxTxSetSize: record.max_tx_set_size,
    protocolVersion: record.protocol_version,
    headerXdr: record.header_xdr ?? ""
  };
}

/** Looks up a ledger by sequence number after verifying network height boundary. */
export async function runLedgerLookup(
  input: LedgerInput,
  network: StellarNetwork
): Promise<Result<LedgerSummary, LedgerErrorCode, LedgerErrorDetail>> {
  const server = horizonServer(network);

  try {
    const root = await server.root();
    const currentHeight = root.history_latest_ledger || root.core_latest_ledger;

    if (currentHeight && input.sequence > currentHeight) {
      return err("future_ledger", { currentHeight });
    }

    const record = (await server
      .ledgers()
      .ledger(input.sequence)
      .call()) as unknown as Horizon.ServerApi.LedgerRecord;
    return ok(normalizeLedger(record));
  } catch (error) {
    return err(toLedgerLookupErrorCode(error));
  }
}
