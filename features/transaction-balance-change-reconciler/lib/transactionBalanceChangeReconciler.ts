import {
  FeeBumpTransaction,
  Transaction,
  TransactionBuilder,
  xdr
} from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import {
  computeBalanceDeltas,
  computeResiduals,
  isFullyReconciled
} from "@/features/transaction-balance-change-reconciler/lib/balance-deltas";
import {
  extractEntryChangePairs,
  metaVariantName
} from "@/features/transaction-balance-change-reconciler/lib/entry-change-pairs";
import { toTransactionBalanceChangeReconcilerErrorCode } from "@/features/transaction-balance-change-reconciler/lib/transactionBalanceChangeReconciler.errors";
import type {
  FeeInfo,
  IncompleteEvidenceReason,
  TransactionBalanceChangeReconcilerErrorCode,
  TransactionBalanceChangeReconcilerInput,
  TransactionBalanceChangeReconcilerResult
} from "@/features/transaction-balance-change-reconciler/types";

function decodeMeta(
  metaXdr: string
): Result<xdr.TransactionMeta, TransactionBalanceChangeReconcilerErrorCode> {
  try {
    const meta = xdr.TransactionMeta.fromXDR(metaXdr, "base64");
    if (!metaVariantName(meta)) return err("unsupported_variant");
    return ok(meta);
  } catch {
    return err("malformed_data");
  }
}

function decodeResult(
  resultXdr: string
): Result<xdr.TransactionResult, TransactionBalanceChangeReconcilerErrorCode> {
  try {
    return ok(xdr.TransactionResult.fromXDR(resultXdr, "base64"));
  } catch {
    return err("malformed_data");
  }
}

function decodeEnvelope(
  envelopeXdr: string,
  networkPassphrase: string
): Result<FeeBumpTransaction | Transaction, TransactionBalanceChangeReconcilerErrorCode> {
  try {
    const kind = xdr.TransactionEnvelope.fromXDR(envelopeXdr, "base64").switch().name;
    if (
      kind !== "envelopeTypeTxV0" &&
      kind !== "envelopeTypeTx" &&
      kind !== "envelopeTypeTxFeeBump"
    ) {
      return err("unsupported_variant");
    }
    return ok(TransactionBuilder.fromXDR(envelopeXdr, networkPassphrase));
  } catch {
    return err("malformed_data");
  }
}

function feeFromEnvelope(decoded: FeeBumpTransaction | Transaction): {
  feeSource: string;
  innerSource: string;
  sponsored: boolean;
} {
  if (decoded instanceof FeeBumpTransaction) {
    return {
      feeSource: decoded.feeSource,
      innerSource: decoded.innerTransaction.source,
      sponsored: decoded.feeSource !== decoded.innerTransaction.source
    };
  }

  return {
    feeSource: decoded.source,
    innerSource: decoded.source,
    sponsored: false
  };
}

function feeFromResult(result: xdr.TransactionResult): string {
  return result.feeCharged().toString();
}

/**
 * Turns pasted envelope + result + metadata XDR into a per-account per-asset
 * balance report with an explicit reconciliation residual.
 *
 * Fully offline: no Horizon/RPC lookup. Expected failures are Result codes —
 * never thrown exceptions.
 */
export function reconcileTransactionBalanceChanges(
  input: TransactionBalanceChangeReconcilerInput
): Result<TransactionBalanceChangeReconcilerResult, TransactionBalanceChangeReconcilerErrorCode> {
  try {
    const metaResult = decodeMeta(input.metaXdr);
    if (!metaResult.ok) return metaResult;

    const resultResult = decodeResult(input.resultXdr);
    if (!resultResult.ok) return resultResult;

    const envelopeResult = decodeEnvelope(input.envelopeXdr, input.networkPassphrase);
    if (!envelopeResult.ok) return envelopeResult;

    const extracted = extractEntryChangePairs(metaResult.value);
    const envelopeFee = feeFromEnvelope(envelopeResult.value);
    const feeCharged = feeFromResult(resultResult.value);

    const fee: FeeInfo = {
      feeCharged,
      feeSource: envelopeFee.feeSource,
      sponsored: envelopeFee.sponsored
    };

    const { deltas, unpairedCount } = computeBalanceDeltas(extracted.pairs);
    const { residuals, reasons: residualReasons } = computeResiduals(deltas, fee);

    const incompleteReasons: IncompleteEvidenceReason[] = [...residualReasons];
    if (unpairedCount > 0) incompleteReasons.push("unpaired_change");
    if (extracted.skippedNonBalanceEntries > 0) incompleteReasons.push("skipped_non_balance");

    const uniqueReasons = [...new Set(incompleteReasons)];
    const fullyReconciled = isFullyReconciled(residuals, uniqueReasons);

    return ok({
      metaVariant: extracted.variant,
      fee,
      pairs: extracted.pairs,
      deltas,
      residuals,
      fullyReconciled,
      evidence: {
        hasEnvelope: true,
        hasResult: true,
        hasMetadata: true,
        metaVariant: extracted.variant,
        balanceEntryCount: extracted.pairs.filter((pair) => pair.asset !== null).length,
        skippedNonBalanceEntries: extracted.skippedNonBalanceEntries,
        incompleteReasons: uniqueReasons
      }
    });
  } catch (error) {
    return err(toTransactionBalanceChangeReconcilerErrorCode(error));
  }
}
