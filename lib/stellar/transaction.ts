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
import { explainResultCode } from "@/lib/stellar/resultCodes";

export function isLikelyTransactionHash(value: string) {
  return /^[a-fA-F0-9]{64}$/.test(value.trim());
}

function getHorizonResultCodes(error: unknown): { transaction?: string; operations?: string[] } | undefined {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return undefined;
  }

  const response = (
    error as {
      response?: { data?: { extras?: { result_codes?: { transaction?: string; operations?: string[] } } } };
    }
  ).response;

  return response?.data?.extras?.result_codes;
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
    const tx = await runHorizonRequest(
      server.transactions().transaction(hash.trim()).call(),
      { signal }
    );

    const memo = tx.memo ? { type: tx.memo_type, value: String(tx.memo) } : undefined;

    return {
      hash: tx.hash,
      ledger: tx.ledger_attr,
      sourceAccount: tx.source_account,
      feeCharged: String(tx.fee_charged),
      createdAt: tx.created_at,
      successful: tx.successful,
      network,
      operationCount: tx.operation_count,
      memo
    };
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

    const resultCodes = getHorizonResultCodes(error);
    if (resultCodes?.transaction) {
      const explanation = explainResultCode(resultCodes.transaction, "transaction");
      throw new Error(`Horizon rejected the transaction (${explanation.code}): ${explanation.explanation}`);
    }

    throw new Error("Could not load transaction from Horizon. Try again in a moment.");
  }
}
