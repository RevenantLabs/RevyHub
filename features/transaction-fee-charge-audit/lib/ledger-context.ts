import { horizonServer } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { err, ok, type Result } from "@/core/result/result";
import { toTransactionFeeChargeAuditErrorCode } from "@/features/transaction-fee-charge-audit/lib/transactionFeeChargeAudit.errors";
import { parseStroopAmount } from "@/features/transaction-fee-charge-audit/lib/stroop-difference";
import type {
  HorizonLedgerRecord,
  LedgerContextData,
  TransactionFeeChargeAuditErrorCode
} from "@/features/transaction-fee-charge-audit/types";

/**
 * Builds the ledger context block shown beside the fee audit. Missing optional
 * fields stay null rather than failing the whole audit — the sequence alone is
 * enough to label which ledger settled the transaction.
 */
export function labelLedgerContext(ledger: HorizonLedgerRecord): LedgerContextData {
  const closedAt =
    typeof ledger.closed_at === "string" && !Number.isNaN(Date.parse(ledger.closed_at))
      ? new Date(ledger.closed_at).toISOString()
      : null;

  return {
    sequence: ledger.sequence,
    closedAt,
    baseFeeInStroops: parseStroopAmount(ledger.base_fee_in_stroops)
  };
}

/**
 * Fetches the ledger Horizon referenced on the transaction record.
 * A 404 maps to `ledger_not_found`; other transport failures stay generic.
 */
export async function fetchLedgerContext(
  sequence: number,
  network: StellarNetwork
): Promise<Result<LedgerContextData, TransactionFeeChargeAuditErrorCode>> {
  if (!Number.isSafeInteger(sequence) || sequence < 1) {
    return err("ledger_not_found");
  }

  try {
    const server = horizonServer(network);
    const ledger = (await server.ledgers().ledger(sequence).call()) as unknown as HorizonLedgerRecord;

    if (typeof ledger.sequence !== "number" || ledger.sequence !== sequence) {
      return err("request_failed");
    }

    return ok(labelLedgerContext(ledger));
  } catch (error) {
    const code = toTransactionFeeChargeAuditErrorCode(error);
    if (code === "transaction_not_found") {
      return err("ledger_not_found");
    }
    return err(code === "request_failed" ? "request_failed" : code);
  }
}
