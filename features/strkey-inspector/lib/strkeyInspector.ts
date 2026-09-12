import { err, ok, type Result } from "@/core/result/result";
import { StrKey } from "@stellar/stellar-sdk";
import type {
  StrKeyKind,
  StrkeyInspectorErrorCode,
  StrkeyInspectorInput,
  StrkeyInspectorResult
} from "@/features/strkey-inspector/types";

const PREFIX_KINDS: Record<string, StrKeyKind> = {
  G: "ed25519_public_key",
  M: "muxed_account",
  C: "contract",
  T: "pre_auth_tx",
  X: "sha256_hash",
  P: "signed_payload"
};

/**
 * Inspects a StrKey string, identifying its kind and decoding its binary payload.
 */
export function inspectStrkey(
  input: StrkeyInspectorInput
): Result<StrkeyInspectorResult, StrkeyInspectorErrorCode> {
  const { value } = input;
  if (!value) {
    return err("empty_input");
  }

  const prefix = value[0] ?? "";
  if (prefix === "S" || prefix === "s") {
    return err("secret_seed_rejected");
  }

  const kind = PREFIX_KINDS[prefix];
  if (!kind) {
    return err("unknown_prefix");
  }

  try {
    if (kind === "ed25519_public_key") {
      const buffer = StrKey.decodeEd25519PublicKey(value);
      return ok({
        kind,
        prefix,
        strkey: value,
        rawBytesHex: buffer.toString("hex"),
        byteLength: buffer.length
      });
    }

    if (kind === "muxed_account") {
      const buffer = StrKey.decodeMed25519PublicKey(value);
      if (buffer.length !== 40) {
        return err("bad_checksum");
      }
      const pubBytes = buffer.subarray(0, 32);
      const idBytes = buffer.subarray(32, 40);
      const muxedGAddress = StrKey.encodeEd25519PublicKey(pubBytes);
      const muxedId = idBytes.readBigUInt64BE(0).toString();
      return ok({
        kind,
        prefix,
        strkey: value,
        rawBytesHex: buffer.toString("hex"),
        byteLength: buffer.length,
        muxedGAddress,
        muxedId
      });
    }

    if (kind === "contract") {
      const buffer = StrKey.decodeContract(value);
      return ok({
        kind,
        prefix,
        strkey: value,
        rawBytesHex: buffer.toString("hex"),
        byteLength: buffer.length
      });
    }

    if (kind === "pre_auth_tx") {
      const buffer = StrKey.decodePreAuthTx(value);
      return ok({
        kind,
        prefix,
        strkey: value,
        rawBytesHex: buffer.toString("hex"),
        byteLength: buffer.length
      });
    }

    if (kind === "sha256_hash") {
      const buffer = StrKey.decodeSha256Hash(value);
      return ok({
        kind,
        prefix,
        strkey: value,
        rawBytesHex: buffer.toString("hex"),
        byteLength: buffer.length
      });
    }

    if (kind === "signed_payload") {
      const buffer = StrKey.decodeSignedPayload(value);
      return ok({
        kind,
        prefix,
        strkey: value,
        rawBytesHex: buffer.toString("hex"),
        byteLength: buffer.length
      });
    }
  } catch {
    return err("bad_checksum");
  }

  return err("unknown_prefix");
}

/**
 * Runs StrKey inspection asynchronously without throwing.
 */
export async function runStrkeyInspector(
  input: StrkeyInspectorInput
): Promise<Result<StrkeyInspectorResult, StrkeyInspectorErrorCode>> {
  return inspectStrkey(input);
}
