import {
  getHorizonServer,
  isCancelledError,
  isTimeoutError,
  mapHorizonError,
  runHorizonRequest,
  STELLAR_NETWORK,
  type StellarNetwork
} from "@/lib/stellar/horizon";
import type { TransactionSummary } from "@/components/stellar/TransactionDetails";

export function isLikelyTransactionHash(value: string) {
  return /^[a-fA-F0-9]{64}$/.test(value.trim());
}

export async function lookupTransaction(
  hash: string,
  network: StellarNetwork = STELLAR_NETWORK,
  signal?: AbortSignal
): Promise<TransactionSummary> {
  // TODO(issue #10): Fetch and normalize transaction operations for display below the transaction summary.
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

    return {
      hash: transaction.hash,
      ledger: transaction.ledger_attr,
      sourceAccount: transaction.source_account,
      feeCharged: String(transaction.fee_charged),
      createdAt: transaction.created_at,
      successful: transaction.successful,
      network,
      operationCount: transaction.operation_count
    };
  } catch (error) {
    if (isCancelledError(error)) {
      throw error;
    }

    if (isTimeoutError(error)) {
      throw new Error("The Horizon transaction request timed out. Try again.");
    }

    const mapped = mapHorizonError(error, "transaction");

    if (mapped.code === "not_found") {
      throw new Error(`Transaction not found on Stellar ${network}.`);
    }

    throw mapped;
  }
}
