import { xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  DecoratedSignatureEntry,
  EnvelopeVariant,
  SignatureGroup,
  SignatureHintAuditorErrorCode
} from "@/features/signature-hint-auditor/types";

/** Four-byte hint as lowercase hex — same encoding as fee-bump-inspector. */
export function hintToHex(hint: Buffer | Uint8Array): string {
  return Buffer.from(hint).toString("hex");
}

function mapSignatures(
  signatures: xdr.DecoratedSignature[],
  group: SignatureGroup
): DecoratedSignatureEntry[] {
  return signatures.map((signature, index) => ({
    index,
    hint: hintToHex(signature.hint()),
    group
  }));
}

export interface DecodedSignatureHints {
  variant: EnvelopeVariant;
  entries: DecoratedSignatureEntry[];
}

/**
 * Decodes ordered decorated-signature hint metadata from a transaction envelope.
 *
 * Fee-bump envelopes contribute two groups — outer then inner — so callers can
 * keep the layers apart. Unsupported discriminants become `unsupported_envelope`
 * rather than a generic decode failure.
 */
export function decodeDecoratedSignatures(
  envelopeBase64: string
): Result<DecodedSignatureHints, SignatureHintAuditorErrorCode> {
  let decoded: xdr.TransactionEnvelope;

  try {
    decoded = xdr.TransactionEnvelope.fromXDR(envelopeBase64, "base64");
  } catch {
    return err("invalid_xdr");
  }

  try {
    switch (decoded.switch().name) {
      case "envelopeTypeTxV0": {
        const entries = mapSignatures(decoded.v0().signatures(), "transaction");
        return ok({ variant: "classic-v0", entries });
      }
      case "envelopeTypeTx": {
        const entries = mapSignatures(decoded.v1().signatures(), "transaction");
        return ok({ variant: "classic-v1", entries });
      }
      case "envelopeTypeTxFeeBump": {
        const feeBump = decoded.feeBump();
        const innerTx = feeBump.tx().innerTx();
        if (innerTx.switch().name !== "envelopeTypeTx") {
          return err("unsupported_envelope");
        }

        const outer = mapSignatures(feeBump.signatures(), "fee_bump_outer");
        const inner = mapSignatures(innerTx.v1().signatures(), "fee_bump_inner");
        return ok({ variant: "fee-bump", entries: [...outer, ...inner] });
      }
      default:
        return err("unsupported_envelope");
    }
  } catch {
    return err("invalid_xdr");
  }
}
