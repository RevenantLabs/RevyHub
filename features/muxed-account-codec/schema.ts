import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  MuxedAccountCodecErrorCode,
  MuxedAccountCodecInput,
  RawMuxedAccountCodecInput
} from "@/features/muxed-account-codec/types";

const MAX_UINT64 = 18446744073709551615n;
const DIGITS_ONLY = /^\d+$/;

/**
 * Validates raw input values for the muxed account codec without throwing.
 */
export function parseMuxedAccountCodecInput(
  raw: RawMuxedAccountCodecInput | string
): Result<MuxedAccountCodecInput, MuxedAccountCodecErrorCode> {
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) {
      return err("empty_input");
    }
    if (trimmed.toUpperCase().startsWith("S")) {
      return err("invalid_muxed_address");
    }
    if (trimmed.startsWith("M")) {
      return parseMuxedAccountCodecInput({
        mode: "decode",
        muxedAddress: trimmed
      });
    }
    if (trimmed.startsWith("G")) {
      const parts = trimmed.split(/[:\s,]+/);
      return parseMuxedAccountCodecInput({
        mode: "encode",
        baseAddress: parts[0] ?? "",
        id: parts[1] ?? ""
      });
    }
    return err("invalid_muxed_address");
  }

  if (raw.mode === "decode") {
    const muxedAddress = (raw.muxedAddress ?? "").replace(/\s+/g, "");
    if (!muxedAddress) {
      return err("empty_input");
    }
    if (muxedAddress.toUpperCase().startsWith("S")) {
      return err("invalid_muxed_address");
    }
    if (!StrKey.isValidMed25519PublicKey(muxedAddress)) {
      return err("invalid_muxed_address");
    }
    return ok({
      mode: "decode",
      muxedAddress
    });
  }

  const baseAddress = (raw.baseAddress ?? "").replace(/\s+/g, "");
  const id = (raw.id ?? "").trim();

  if (!baseAddress && !id) {
    return err("empty_input");
  }
  if (!baseAddress) {
    return err("invalid_base_address");
  }
  if (baseAddress.toUpperCase().startsWith("S")) {
    return err("invalid_base_address");
  }
  if (!StrKey.isValidEd25519PublicKey(baseAddress)) {
    return err("invalid_base_address");
  }
  if (!id) {
    return err("invalid_id");
  }
  if (!DIGITS_ONLY.test(id)) {
    return err("invalid_id");
  }

  try {
    const idBigInt = BigInt(id);
    if (idBigInt < 0n || idBigInt > MAX_UINT64) {
      return err("invalid_id");
    }
  } catch {
    return err("invalid_id");
  }

  return ok({
    mode: "encode",
    baseAddress,
    id
  });
}
