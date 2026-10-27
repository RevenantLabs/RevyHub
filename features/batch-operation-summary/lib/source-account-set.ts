import { encodeMuxedAccountToAddress, StrKey, xdr } from "@stellar/stellar-sdk";

export function transactionSource(tx: xdr.Transaction | xdr.TransactionV0): string {
  return "sourceAccountEd25519" in tx
    ? StrKey.encodeEd25519PublicKey(tx.sourceAccountEd25519())
    : encodeMuxedAccountToAddress(tx.sourceAccount(), true);
}

export function collectOperationSources(operations: xdr.Operation[]): string[] {
  const sources = operations.flatMap((operation) => {
    const source = operation.sourceAccount();
    return source ? [encodeMuxedAccountToAddress(source, true)] : [];
  });
  return [...new Set(sources)].sort();
}
