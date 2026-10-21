import { xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { parseSigningPayloadInspectorInput } from "@/features/signing-payload-inspector/schema";
import { networkId } from "@/features/signing-payload-inspector/lib/network-id";
import { signatureBase, v0SigningTransaction } from "@/features/signing-payload-inspector/lib/signature-base";
import { payloadHash } from "@/features/signing-payload-inspector/lib/payload-hash";
import { toSigningPayloadInspectorErrorCode } from "@/features/signing-payload-inspector/lib/signingPayloadInspector.errors";
import type { SigningPayload, SigningPayloadInspectorErrorCode, SigningPayloadInspectorResult } from "@/features/signing-payload-inspector/types";

function describePayload(id: Buffer, tag: SigningPayload["tag"], tx: xdr.Transaction | xdr.FeeBumpTransaction): SigningPayload {
  const bytes = signatureBase(id, tag, tx);
  return {
    tag,
    signatureBaseHex: bytes.toString("hex"),
    payloadHashHex: payloadHash(bytes).toString("hex"),
    byteLength: bytes.length
  };
}

/** Validate first; decode and hash only a bounded transaction envelope, entirely offline. */
export function runSigningPayloadInspector(
  raw: string,
  network: StellarNetwork
): Result<SigningPayloadInspectorResult, SigningPayloadInspectorErrorCode> {
  const parsed = parseSigningPayloadInspectorInput(raw);
  if (!parsed.ok) return parsed;

  // EnvelopeType is shared with SCP and auth envelopes. Distinguish those
  // recognized tags from malformed input before decoding the transaction arm.
  const prefix = Buffer.from(parsed.value.envelope, "base64");
  if (prefix.length < 4) return err("invalid_xdr");
  const tag = prefix.readUInt32BE(0);
  if (tag === 1 || tag === 3 || tag === 4) return err("unsupported_envelope");
  if (tag !== 0 && tag !== 2 && tag !== 5) return err("invalid_xdr");

  let envelope: xdr.TransactionEnvelope;
  try {
    envelope = xdr.TransactionEnvelope.fromXDR(parsed.value.envelope, "base64");
  } catch {
    return err(toSigningPayloadInspectorErrorCode());
  }

  const variant = envelope.switch().name;
  if (variant !== "envelopeTypeTxV0" && variant !== "envelopeTypeTx" && variant !== "envelopeTypeTxFeeBump") {
    return err("unsupported_envelope");
  }

  try {
    const id = networkId(network);
    const base = { network, networkIdHex: id.toString("hex") };
    if (variant === "envelopeTypeTxV0") {
      return ok({ ...base, variant: "classic-v0", outer: describePayload(id, "classic", v0SigningTransaction(envelope.v0().tx())), inner: null });
    }
    if (variant === "envelopeTypeTx") {
      return ok({ ...base, variant: "classic-v1", outer: describePayload(id, "classic", envelope.v1().tx()), inner: null });
    }
    const feeBump = envelope.feeBump().tx();
    const inner = feeBump.innerTx();
    if (inner.switch().name !== "envelopeTypeTx") return err("unsupported_envelope");
    return ok({
      ...base,
      variant: "fee-bump",
      outer: describePayload(id, "fee-bump", feeBump),
      inner: describePayload(id, "classic", inner.v1().tx())
    });
  } catch {
    return err(toSigningPayloadInspectorErrorCode());
  }
}
