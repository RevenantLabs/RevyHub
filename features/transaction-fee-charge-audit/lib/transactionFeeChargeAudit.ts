import { horizonServer } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { err, ok, type Result } from "@/core/result/result";
import { normalizeFeeFields } from "@/features/transaction-fee-charge-audit/lib/fee-fields";
import { fetchLedgerContext } from "@/features/transaction-fee-charge-audit/lib/ledger-context";
import { toTransactionFeeChargeAuditErrorCode } from "@/features/transaction-fee-charge-audit/lib/transactionFeeChargeAudit.errors";
import type {
  HorizonTransactionRecord,
  TransactionFeeChargeAuditErrorCode,
  TransactionFeeChargeAuditInput,
  TransactionFeeChargeAuditResult
} from "@/features/transaction-fee-charge-audit/types";

/**
 * Audits the maximum fee offered versus the fee charged for one settled
 * transaction. Historical evidence only — never a forecast.
 */
export async function runTransactionFeeChargeAudit(
  input: TransactionFeeChargeAuditInput,
  network: StellarNetwork,
  _signal?: AbortSignal
): Promise<Result<TransactionFeeChargeAuditResult, TransactionFeeChargeAuditErrorCode>> {
  let transaction: HorizonTransactionRecord;

  try {
    const server = horizonServer(network);
    transaction = (await server
      .transactions()
      .transaction(input.hash)
      .call()) as unknown as HorizonTransactionRecord;
  } catch (error) {
    return err(toTransactionFeeChargeAuditErrorCode(error));
  }

  if (typeof transaction.hash !== "string" || !transaction.hash) {
    return err("request_failed");
  }

  if (
    typeof transaction.operation_count !== "number" ||
    !Number.isSafeInteger(transaction.operation_count) ||
    transaction.operation_count < 0
  ) {
    return err("invalid_fee_data");
  }

  if (typeof transaction.ledger !== "number" || !Number.isSafeInteger(transaction.ledger)) {
    return err("invalid_fee_data");
  }

  const envelope = normalizeFeeFields(transaction, network);
  if (!envelope.ok) {
    return envelope;
  }

  const ledger = await fetchLedgerContext(transaction.ledger, network);
  if (!ledger.ok) {
    return ledger;
  }

  return ok({
    hash: transaction.hash,
    network,
    operationCount: transaction.operation_count,
    ledger: ledger.value,
    envelope: envelope.value
  });
}
