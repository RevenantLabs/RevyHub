import { xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { parseAccountMergeValueReconcilerInput } from "../schema";
import type { AccountMergeValueReconcilerErrorCode as Code, AccountMergeValueReconcilerInput as Input, AccountMergeValueReconcilerResult as Reconciliation } from "../types";
import { readEnvelope, mapMergeResults } from "./merge-result-map";
import { metadataOperations, reconcileValue } from "./value-reconciliation";
import {
  SUPPORTED_ENVELOPE_TYPES,
  SUPPORTED_METADATA_VERSIONS,
  peekDiscriminant,
  toAccountMergeValueReconcilerErrorCode
} from "./accountMergeValueReconciler.errors";

/**
 * Decodes the three pasted XDR values locally, checks that they describe one
 * compatible transaction, and reconciles each account merge. Never performs a
 * request; never throws for user-caused input.
 */
export function runAccountMergeValueReconciler(raw: Input): Result<Reconciliation, Code> {
  const parsed = parseAccountMergeValueReconcilerInput(raw);
  if (!parsed.ok) return parsed;
  const { envelope: envelopeXdr, resultXdr, metadataXdr } = parsed.value;

  const envelopeType = peekDiscriminant(envelopeXdr);
  if (envelopeType !== null && !SUPPORTED_ENVELOPE_TYPES.has(envelopeType)) return err("unsupported_variant");
  const metaVersion = metadataXdr ? peekDiscriminant(metadataXdr) : null;
  if (metaVersion !== null && !SUPPORTED_METADATA_VERSIONS.has(metaVersion)) return err("unsupported_variant");

  let envelope: xdr.TransactionEnvelope;
  let result: xdr.TransactionResult;
  let meta: xdr.TransactionMeta | null;
  try {
    envelope = xdr.TransactionEnvelope.fromXDR(envelopeXdr, "base64");
    result = xdr.TransactionResult.fromXDR(resultXdr, "base64");
    meta = metadataXdr ? xdr.TransactionMeta.fromXDR(metadataXdr, "base64") : null;
  } catch (error) { return err(toAccountMergeValueReconcilerErrorCode(error)); }

  const read = readEnvelope(envelope);
  if (!read.ok) return read;
  const mapped = mapMergeResults(read.value, result);
  if (!mapped.ok) return mapped;

  if (meta) {
    const metadata = metadataOperations(meta);
    if (!metadata) return err("unsupported_variant");
    // A successful transaction records one OperationMeta per operation; a failed
    // one records none (or, defensively, the full set). Anything else is a
    // different transaction.
    const count = metadata.operations.length;
    const expected = read.value.operations.length;
    if (mapped.value.transactionFailed ? count !== 0 && count !== expected : count !== expected) {
      return err("incompatible_transaction");
    }
  }

  let reconciliation: ReturnType<typeof reconcileValue>;
  try {
    reconciliation = reconcileValue(mapped.value.transfers, read.value.operations.length, meta, mapped.value.transactionFailed, read.value.feePayer);
  } catch (error) { return err(toAccountMergeValueReconcilerErrorCode(error)); }

  const proceeds = mapped.value.transfers.reduce((sum, transfer) => sum + BigInt(transfer.stroops ?? "0"), 0n);
  return ok({
    envelopeKind: read.value.kind,
    feePayer: read.value.feePayer,
    transactionSource: read.value.source,
    feeStroops: result.feeCharged().toString(),
    mergeProceedsStroops: proceeds.toString(),
    unrelatedBalanceChangesStroops: reconciliation.unrelatedBalanceChangesStroops,
    unrelatedChanges: reconciliation.unrelatedChanges,
    transfers: mapped.value.transfers,
    gaps: reconciliation.gaps,
    evidence: reconciliation.gaps.length ? "incomplete" : "complete",
    metadataVersion: reconciliation.metadataVersion
  });
}
