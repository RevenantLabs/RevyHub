import { getHorizonServer, STELLAR_NETWORK, type StellarNetwork } from "@/lib/stellar/horizon";
import { getResponseStatus } from "@/lib/stellar/account";
import type { TransactionSummary } from "@/components/stellar/TransactionDetails";

export function isLikelyTransactionHash(value: string) {
  return /^[a-fA-F0-9]{64}$/.test(value.trim());
}

export interface RawTransactionData {
  pagingToken: string;
  envelopeXdr: string;
  resultXdr: string;
  resultMetaXdr?: string;
  feeMetaXdr?: string;
  maxFee: string;
  feeAccount?: string;
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
    const transaction = await server.transactions().transaction(hash.trim()).call();

    const raw: RawTransactionData = {
      pagingToken: transaction.paging_token,
      envelopeXdr: transaction.envelope_xdr,
      resultXdr: transaction.result_xdr,
      resultMetaXdr: transaction.result_meta_xdr,
      feeMetaXdr: transaction.fee_meta_xdr,
      maxFee: String(transaction.max_fee),
      feeAccount: transaction.fee_account,
    };

    return {
      hash: transaction.hash,
      ledger: transaction.ledger_attr,
      sourceAccount: transaction.source_account,
      feeCharged: String(transaction.fee_charged),
      createdAt: transaction.created_at,
      successful: transaction.successful,
      network,
      operationCount: transaction.operation_count,
      raw,
    };
  } catch (error) {
    if (getResponseStatus(error) === 404) {
      throw new Error(`Transaction not found on Stellar ${network}.`);
    }

    throw new Error("Could not load transaction from Horizon. Try again in a moment.");
  }
}
