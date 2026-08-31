import { err, ok, type Result } from "@/core/result/result";
import { horizonServer } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { extractResultCode } from "@/features/transaction-lookup/lib/format";
import { toTransactionErrorCode } from "@/features/transaction-lookup/lib/transactionLookup.errors";
import type {
  TransactionErrorCode,
  TransactionInput,
  TransactionOperation,
  TransactionSummary
} from "@/features/transaction-lookup/types";

interface HorizonTransaction {
  hash: string;
  ledger: number;
  successful: boolean;
  source_account: string;
  fee_charged: string | number;
  max_fee: string | number;
  operation_count: number;
  created_at: string;
  memo_type: string;
  memo?: string;
  result_xdr?: string;
}

interface HorizonOperation {
  id: string;
  type: string;
  source_account: string;
}

export function normalizeTransaction(
  transaction: HorizonTransaction,
  operations: HorizonOperation[]
): TransactionSummary {
  const summary: TransactionSummary = {
    hash: transaction.hash,
    ledger: transaction.ledger,
    successful: transaction.successful,
    sourceAccount: transaction.source_account,
    feeCharged: String(transaction.fee_charged),
    maxFee: String(transaction.max_fee),
    operationCount: transaction.operation_count,
    createdAt: transaction.created_at,
    memoType: transaction.memo_type,
    memo: transaction.memo,
    operations: operations.map(normalizeOperation)
  };

  if (!transaction.successful) {
    const resultCode = extractResultCode(transaction.result_xdr);
    if (resultCode) summary.resultCode = resultCode;
  }

  return summary;
}

export function normalizeOperation(operation: HorizonOperation): TransactionOperation {
  return {
    id: operation.id,
    type: operation.type,
    sourceAccount: operation.source_account
  };
}

export async function lookupTransaction(
  { hash }: TransactionInput,
  network: StellarNetwork
): Promise<Result<TransactionSummary, TransactionErrorCode>> {
  try {
    const server = horizonServer(network);
    const transaction = (await server
      .transactions()
      .transaction(hash)
      .call()) as unknown as HorizonTransaction;

    // Operations are a second request. A transaction with no readable
    // operations is still worth showing, so this failure is non-fatal.
    let operations: HorizonOperation[] = [];
    try {
      const page = await server.operations().forTransaction(hash).limit(200).call();
      operations = page.records as unknown as HorizonOperation[];
    } catch {
      operations = [];
    }

    return ok(normalizeTransaction(transaction, operations));
  } catch (error) {
    return err(toTransactionErrorCode(error));
  }
}
