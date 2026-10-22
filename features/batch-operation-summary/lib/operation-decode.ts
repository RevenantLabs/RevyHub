import { encodeMuxedAccountToAddress, xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { collectOperationSources, transactionSource } from "@/features/batch-operation-summary/lib/source-account-set";
import type { BatchOperationSummaryErrorCode } from "@/features/batch-operation-summary/types";

export interface DecodedOperation { type: string; source: string | null; nativeStroops: string | null }
export interface DecodedBatch { transactionSource: string; operationSources: string[]; operations: DecodedOperation[] }

function nativeAmount(body: xdr.OperationBody): string | null {
  switch (body.switch().name) {
    case "payment": { const value = body.paymentOp(); return value.asset().switch().name === "assetTypeNative" ? value.amount().toString() : null; }
    case "pathPaymentStrictSend": { const value = body.pathPaymentStrictSendOp(); return value.sendAsset().switch().name === "assetTypeNative" ? value.sendAmount().toString() : null; }
    case "pathPaymentStrictReceive": { const value = body.pathPaymentStrictReceiveOp(); return value.destAsset().switch().name === "assetTypeNative" ? value.destAmount().toString() : null; }
    default: return null;
  }
}

function envelopeTransaction(envelope: xdr.TransactionEnvelope): xdr.Transaction | xdr.TransactionV0 | null {
  switch (envelope.switch().name) {
    case "envelopeTypeTxV0": return envelope.v0().tx();
    case "envelopeTypeTx": return envelope.v1().tx();
    case "envelopeTypeTxFeeBump": {
      const inner = envelope.feeBump().tx().innerTx();
      return inner.switch().name === "envelopeTypeTx" ? inner.v1().tx() : null;
    }
    default: return null;
  }
}

export function decodeOperations(envelopeXdr: string): Result<DecodedBatch, BatchOperationSummaryErrorCode> {
  try {
    const envelope = xdr.TransactionEnvelope.fromXDR(envelopeXdr, "base64");
    const tx = envelopeTransaction(envelope);
    if (!tx) return err("invalid_xdr");
    const operations = tx.operations();
    return ok({
      transactionSource: transactionSource(tx),
      operationSources: collectOperationSources(operations),
      operations: operations.map((operation) => ({
        type: operation.body().switch().name,
        source: operation.sourceAccount() ? encodeMuxedAccountToAddress(operation.sourceAccount()!, true) : null,
        nativeStroops: nativeAmount(operation.body())
      }))
    });
  } catch { return err("invalid_xdr"); }
}
