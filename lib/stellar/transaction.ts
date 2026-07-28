import { getHorizonServer, STELLAR_NETWORK, type StellarNetwork } from "@/lib/stellar/horizon";
import { getResponseStatus } from "@/lib/stellar/account";
import type { TransactionSummary } from "@/components/stellar/TransactionDetails";

export function isLikelyTransactionHash(value: string) {
  return /^[a-fA-F0-9]{64}$/.test(value.trim());
}

export async function lookupTransaction(
  hash: string,
  network: StellarNetwork = STELLAR_NETWORK
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
    const tx = await server.transactions().transaction(hash.trim()).call();

    const memo =
      tx.memo_type && tx.memo_type !== "none" && tx.memo
        ? { type: tx.memo_type, value: String(tx.memo) }
        : undefined;

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
    if (getResponseStatus(error) === 404) {
      throw new Error(`Transaction not found on Stellar ${network}.`);
    }

    throw new Error("Could not load transaction from Horizon. Try again in a moment.");
  }
}
