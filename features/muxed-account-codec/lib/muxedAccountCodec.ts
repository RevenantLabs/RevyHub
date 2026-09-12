import { Buffer } from "node:buffer";
import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  MuxedAccountCodecErrorCode,
  MuxedAccountCodecInput,
  MuxedAccountCodecResult
} from "@/features/muxed-account-codec/types";

const MAX_UINT64 = 18446744073709551615n;
const DIGITS_ONLY = /^\d+$/;

/**
 * Decodes a SEP-0023 multiplexed address (M...) into its base Ed25519 public key (G...)
 * and its 64-bit unsigned multiplexing ID.
 */
export function decodeMuxedAddress(
  muxedAddress: string
): Result<{ baseAddress: string; id: string }, MuxedAccountCodecErrorCode> {
  const normalized = muxedAddress.replace(/\s+/g, "");

  if (normalized.toUpperCase().startsWith("S")) {
    return err("invalid_muxed_address");
  }

  if (!StrKey.isValidMed25519PublicKey(normalized)) {
    return err("invalid_muxed_address");
  }

  try {
    const raw = StrKey.decodeMed25519PublicKey(normalized);
    if (raw.length !== 40) {
      return err("invalid_muxed_address");
    }

    const pubkeyBytes = raw.subarray(0, 32);
    const idBytes = raw.subarray(32, 40);

    const baseAddress = StrKey.encodeEd25519PublicKey(pubkeyBytes);
    const id = idBytes.readBigUInt64BE().toString();

    return ok({ baseAddress, id });
  } catch {
    return err("invalid_muxed_address");
  }
}

/**
 * Encodes a base Ed25519 public key (G...) and a 64-bit unsigned multiplexing ID
 * into a SEP-0023 multiplexed address (M...).
 */
export function encodeMuxedAddress(
  baseAddress: string,
  id: string
): Result<{ muxedAddress: string }, MuxedAccountCodecErrorCode> {
  const normalizedBase = baseAddress.replace(/\s+/g, "");
  const normalizedId = id.trim();

  if (normalizedBase.toUpperCase().startsWith("S")) {
    return err("invalid_base_address");
  }

  if (!StrKey.isValidEd25519PublicKey(normalizedBase)) {
    return err("invalid_base_address");
  }

  if (!DIGITS_ONLY.test(normalizedId)) {
    return err("invalid_id");
  }

  let idBigInt: bigint;
  try {
    idBigInt = BigInt(normalizedId);
    if (idBigInt < 0n || idBigInt > MAX_UINT64) {
      return err("invalid_id");
    }
  } catch {
    return err("invalid_id");
  }

  try {
    const pubkeyBytes = StrKey.decodeEd25519PublicKey(normalizedBase);
    const idBuf = Buffer.alloc(8);
    idBuf.writeBigUInt64BE(idBigInt);

    const payload = Buffer.concat([pubkeyBytes, idBuf]);
    const muxedAddress = StrKey.encodeMed25519PublicKey(payload);

    return ok({ muxedAddress });
  } catch {
    return err("invalid_base_address");
  }
}

/**
 * Executes encoding or decoding based on input configuration without throwing.
 */
export function runMuxedAccountCodec(
  input: MuxedAccountCodecInput
): Result<MuxedAccountCodecResult, MuxedAccountCodecErrorCode> {
  if (input.mode === "decode") {
    if (!input.muxedAddress) {
      return err("empty_input");
    }
    const decoded = decodeMuxedAddress(input.muxedAddress);
    if (!decoded.ok) {
      return err(decoded.code);
    }
    return ok({
      mode: "decode",
      muxedAddress: input.muxedAddress,
      baseAddress: decoded.value.baseAddress,
      id: decoded.value.id
    });
  }

  if (!input.baseAddress && !input.id) {
    return err("empty_input");
  }
  if (!input.baseAddress) {
    return err("invalid_base_address");
  }
  if (!input.id) {
    return err("invalid_id");
  }

  const encoded = encodeMuxedAddress(input.baseAddress, input.id);
  if (!encoded.ok) {
    return err(encoded.code);
  }

  return ok({
    mode: "encode",
    muxedAddress: encoded.value.muxedAddress,
    baseAddress: input.baseAddress,
    id: input.id
  });
}
