import { encodeMuxedAccountToAddress, StrKey, xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  EnvelopeSummary,
  MemoSummary,
  PreconditionsSummary,
  TimeBoundsSummary,
  XdrErrorCode,
  XdrInput
} from "@/features/xdr-inspector/types";

const emptyPreconditions = (): PreconditionsSummary => ({
  timeBounds: null,
  ledgerBounds: null,
  minSequenceNumber: null,
  minSequenceAge: null,
  minSequenceLedgerGap: null,
  extraSignerCount: 0
});

export function summarizeMemo(memo: xdr.Memo): MemoSummary {
  switch (memo.switch().name) {
    case "memoText":
      return { type: "text", value: memo.text().toString() };
    case "memoId":
      return { type: "id", value: memo.id().toString() };
    case "memoHash":
      return { type: "hash", value: memo.hash().toString("hex") };
    case "memoReturn":
      return { type: "return", value: memo.retHash().toString("hex") };
    default:
      return { type: "none", value: null };
  }
}

function summarizeTimeBounds(bounds: xdr.TimeBounds | null): TimeBoundsSummary | null {
  if (!bounds) return null;
  return { minTime: bounds.minTime().toString(), maxTime: bounds.maxTime().toString() };
}

export function summarizePreconditions(cond: xdr.Preconditions): PreconditionsSummary {
  switch (cond.switch().name) {
    case "precondTime":
      return { ...emptyPreconditions(), timeBounds: summarizeTimeBounds(cond.timeBounds()) };
    case "precondV2": {
      const v2 = cond.v2();
      const ledgerBounds = v2.ledgerBounds();
      const minSeqNum = v2.minSeqNum();

      return {
        timeBounds: summarizeTimeBounds(v2.timeBounds()),
        ledgerBounds: ledgerBounds
          ? { minLedger: ledgerBounds.minLedger(), maxLedger: ledgerBounds.maxLedger() }
          : null,
        minSequenceNumber: minSeqNum ? minSeqNum.toString() : null,
        minSequenceAge: v2.minSeqAge().toString(),
        minSequenceLedgerGap: v2.minSeqLedgerGap(),
        extraSignerCount: v2.extraSigners().length
      };
    }
    default:
      return emptyPreconditions();
  }
}

function operationTypeNames(operations: xdr.Operation[]): string[] {
  return operations.map((operation) => operation.body().switch().name);
}

function summarizeV0(envelope: xdr.TransactionV0Envelope): EnvelopeSummary {
  const tx = envelope.tx();

  return {
    variant: "classic-v0",
    sourceAccount: StrKey.encodeEd25519PublicKey(tx.sourceAccountEd25519()),
    sequence: tx.seqNum().toString(),
    fee: tx.fee().toString(),
    memo: summarizeMemo(tx.memo()),
    preconditions: { ...emptyPreconditions(), timeBounds: summarizeTimeBounds(tx.timeBounds()) },
    operationTypes: operationTypeNames(tx.operations()),
    signatureCount: envelope.signatures().length,
    feeBump: null
  };
}

function summarizeV1(envelope: xdr.TransactionV1Envelope): EnvelopeSummary {
  const tx = envelope.tx();

  return {
    variant: "classic-v1",
    sourceAccount: encodeMuxedAccountToAddress(tx.sourceAccount(), true),
    sequence: tx.seqNum().toString(),
    fee: tx.fee().toString(),
    memo: summarizeMemo(tx.memo()),
    preconditions: summarizePreconditions(tx.cond()),
    operationTypes: operationTypeNames(tx.operations()),
    signatureCount: envelope.signatures().length,
    feeBump: null
  };
}

function summarizeFeeBump(
  envelope: xdr.FeeBumpTransactionEnvelope
): Result<EnvelopeSummary, XdrErrorCode> {
  const tx = envelope.tx();
  const innerTx = tx.innerTx();

  if (innerTx.switch().name !== "envelopeTypeTx") return err("unsupported_envelope");

  // The summary describes the inner transaction — that is the transaction that
  // will actually execute — with the outer fee-bump wrapper reported alongside.
  const inner = summarizeV1(innerTx.v1());

  return ok({
    ...inner,
    variant: "fee-bump",
    feeBump: {
      feeSource: encodeMuxedAccountToAddress(tx.feeSource(), true),
      totalFee: tx.fee().toString(),
      outerSignatureCount: envelope.signatures().length
    }
  });
}

/**
 * Decodes a transaction envelope entirely in-process.
 *
 * No network request is made, the input is never logged or persisted, and the
 * tool never offers to sign or submit — an envelope handed over by a stranger
 * is exactly the social-engineering path this tool must refuse to be part of.
 */
export function inspectEnvelope({ envelope }: XdrInput): Result<EnvelopeSummary, XdrErrorCode> {
  let decoded: xdr.TransactionEnvelope;

  try {
    decoded = xdr.TransactionEnvelope.fromXDR(envelope, "base64");
  } catch {
    return err("malformed_envelope");
  }

  try {
    switch (decoded.switch().name) {
      case "envelopeTypeTxV0":
        return ok(summarizeV0(decoded.v0()));
      case "envelopeTypeTx":
        return ok(summarizeV1(decoded.v1()));
      case "envelopeTypeTxFeeBump":
        return summarizeFeeBump(decoded.feeBump());
      default:
        return err("unsupported_envelope");
    }
  } catch {
    // The envelope decoded but a field could not be normalised for display.
    return err("malformed_envelope");
  }
}
