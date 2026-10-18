import { xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  BudgetAssessment,
  EnvelopeKind,
  LayerBreakdown,
  SizeErrorCode,
  SizeInput,
  SizeReport,
  SizeSection
} from "@/features/transaction-size-analyzer/types";

/**
 * Every XDR discriminant and every vector length prefix is a 4-byte big-endian
 * integer. Naming it once keeps the arithmetic below readable.
 */
export const XDR_WORD = 4;

interface Encodable {
  toXDR(format?: "raw"): Buffer;
}

function encodedLength(value: Encodable): number {
  return value.toXDR().length;
}

/**
 * Measures a vector as XDR actually encodes it: a 4-byte element count
 * followed by each element.
 *
 * Element encodings already include their own padding to a 4-byte boundary,
 * so summing measured elements needs no extra rounding.
 */
function vectorBytes(elements: Encodable[]): number {
  return XDR_WORD + elements.reduce((total, element) => total + encodedLength(element), 0);
}

function elementBytes(elements: Encodable[]): number[] {
  return elements.map(encodedLength);
}

function sumSections(sections: SizeSection[]): number {
  return sections.reduce((total, section) => total + section.bytes, 0);
}

/**
 * Builds the breakdown of a v1 transaction envelope body.
 *
 * `bodyBytes` is whatever the caller has already established this envelope
 * occupies, so the same routine serves a standalone v1 envelope and the inner
 * envelope of a fee bump.
 */
function v1Sections(
  envelope: xdr.TransactionV1Envelope,
  bodyBytes: number
): { sections: SizeSection[]; operationBytes: number[]; signatureBytes: number[] } {
  const operations = envelope.tx().operations();
  const signatures = envelope.signatures();

  const operationsBytes = vectorBytes(operations);
  const signaturesBytes = vectorBytes(signatures);

  return {
    // Whatever is left after the two vectors is the transaction header:
    // source, sequence, fee, memo, preconditions and extension.
    sections: [
      { key: "transaction_body", bytes: bodyBytes - operationsBytes - signaturesBytes },
      { key: "operations", bytes: operationsBytes },
      { key: "signatures", bytes: signaturesBytes }
    ],
    operationBytes: elementBytes(operations),
    signatureBytes: elementBytes(signatures)
  };
}

function v0Layer(envelope: xdr.TransactionV0Envelope, totalBytes: number): LayerBreakdown {
  const operations = envelope.tx().operations();
  const signatures = envelope.signatures();

  const operationsBytes = vectorBytes(operations);
  const signaturesBytes = vectorBytes(signatures);

  return {
    totalBytes,
    sections: [
      { key: "envelope_discriminant", bytes: XDR_WORD },
      {
        key: "transaction_body",
        bytes: totalBytes - XDR_WORD - operationsBytes - signaturesBytes
      },
      { key: "operations", bytes: operationsBytes },
      { key: "signatures", bytes: signaturesBytes }
    ],
    operationCount: operations.length,
    signatureCount: signatures.length,
    operationBytes: elementBytes(operations),
    signatureBytes: elementBytes(signatures)
  };
}

function v1Layer(envelope: xdr.TransactionV1Envelope, totalBytes: number): LayerBreakdown {
  const { sections, operationBytes, signatureBytes } = v1Sections(
    envelope,
    totalBytes - XDR_WORD
  );

  return {
    totalBytes,
    sections: [{ key: "envelope_discriminant", bytes: XDR_WORD }, ...sections],
    operationCount: envelope.tx().operations().length,
    signatureCount: envelope.signatures().length,
    operationBytes,
    signatureBytes
  };
}

export function assessBudget(totalBytes: number, budgetBytes: number): BudgetAssessment {
  const withinBudget = totalBytes <= budgetBytes;

  return {
    budgetBytes,
    withinBudget,
    headroomBytes: withinBudget ? budgetBytes - totalBytes : 0,
    overageBytes: withinBudget ? 0 : totalBytes - budgetBytes
  };
}

/**
 * Measures a transaction envelope's serialized size and itemises it.
 *
 * Sizes are read back from the XDR encoder rather than computed from a schema
 * the tool holds separately: the encoder is the only thing that knows the real
 * answer, and a hand-maintained size table would drift from the protocol.
 */
export function analyzeSize({
  envelope,
  budgetBytes
}: SizeInput): Result<SizeReport, SizeErrorCode> {
  let decoded: xdr.TransactionEnvelope;

  try {
    decoded = xdr.TransactionEnvelope.fromXDR(envelope, "base64");
  } catch {
    return err("invalid_xdr");
  }

  let totalBytes: number;
  let normalizedBase64Length: number;

  try {
    totalBytes = decoded.toXDR().length;
    normalizedBase64Length = decoded.toXDR("base64").length;
  } catch {
    return err("invalid_xdr");
  }

  let kind: EnvelopeKind;
  let outer: LayerBreakdown;
  let inner: LayerBreakdown | null = null;

  try {
    switch (decoded.switch().name) {
      case "envelopeTypeTxV0":
        kind = "classic-v0";
        outer = v0Layer(decoded.v0(), totalBytes);
        break;

      case "envelopeTypeTx":
        kind = "classic-v1";
        outer = v1Layer(decoded.v1(), totalBytes);
        break;

      case "envelopeTypeTxFeeBump": {
        kind = "fee-bump";
        const feeBump = decoded.feeBump();
        const innerTx = feeBump.tx().innerTx();

        if (innerTx.switch().name !== "envelopeTypeTx") return err("invalid_xdr");

        const innerEnvelope = innerTx.v1();
        // The inner envelope occupies its own discriminant plus its body. That
        // single number is the inner section of the outer envelope *and* the
        // inner layer's own total, so the inner transaction is never counted
        // twice.
        const innerBlockBytes = XDR_WORD + encodedLength(innerEnvelope);
        const outerSignatures = feeBump.signatures();
        const outerSignaturesBytes = vectorBytes(outerSignatures);

        outer = {
          totalBytes,
          sections: [
            { key: "envelope_discriminant", bytes: XDR_WORD },
            {
              key: "fee_bump_body",
              bytes: totalBytes - XDR_WORD - innerBlockBytes - outerSignaturesBytes
            },
            { key: "inner_envelope", bytes: innerBlockBytes },
            { key: "signatures", bytes: outerSignaturesBytes }
          ],
          operationCount: 0,
          signatureCount: outerSignatures.length,
          operationBytes: [],
          signatureBytes: elementBytes(outerSignatures)
        };

        const innerParts = v1Sections(innerEnvelope, innerBlockBytes - XDR_WORD);
        inner = {
          totalBytes: innerBlockBytes,
          sections: [{ key: "inner_discriminant", bytes: XDR_WORD }, ...innerParts.sections],
          operationCount: innerEnvelope.tx().operations().length,
          signatureCount: innerEnvelope.signatures().length,
          operationBytes: innerParts.operationBytes,
          signatureBytes: innerParts.signatureBytes
        };
        break;
      }

      default:
        return err("invalid_xdr");
    }
  } catch {
    return err("invalid_xdr");
  }

  // The sections are only worth showing if they are provably exhaustive. If
  // they are not, the measured totals still stand and the itemisation is
  // withheld rather than presented as an approximation.
  const breakdownComplete =
    sumSections(outer.sections) === outer.totalBytes &&
    (inner === null || sumSections(inner.sections) === inner.totalBytes);

  if (!breakdownComplete) {
    outer = { ...outer, sections: [] };
    if (inner) inner = { ...inner, sections: [] };
  }

  return ok({
    kind,
    totalBytes,
    normalizedBase64Length,
    pastedBase64Length: envelope.length,
    outer,
    inner,
    budget: budgetBytes === null ? null : assessBudget(totalBytes, budgetBytes),
    breakdownComplete
  });
}
