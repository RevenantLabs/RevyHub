import { err, ok, type Result } from "@/core/result/result";
import type {
  InputRejectionReason,
  ManageDataErrorCode,
  ManageDataInput,
  ManageDataMode,
  ValueEncoding
} from "@/features/manage-data-codec/types";

/** The protocol bound on a data entry name, in **bytes**, not characters. */
export const MAX_NAME_BYTES = 64;

/** The protocol bound on a data entry value, in bytes. */
export const MAX_VALUE_BYTES = 64;

/**
 * A generous cap on raw text before decoding.
 *
 * Hex doubles and base64 inflates, so the typed text can legitimately be
 * longer than 64 characters while still decoding to 64 bytes. This bound only
 * exists to stop a pasted file from reaching the decoder at all.
 */
export const MAX_RAW_LENGTH = 4_096;

const HEX = /^[0-9a-fA-F]*$/;
const BASE64 = /^[A-Za-z0-9+/]*={0,2}$/;

/** StrKey shape of an ed25519 secret seed, matched on the `S` prefix alone. */
const SECRET_SEED = /^S[A-Z2-7]{55}$/;

export interface RawManageDataInput {
  mode: ManageDataMode;
  name: string;
  value: string;
  encoding: ValueEncoding;
}

const encoder = new TextEncoder();

/** UTF-8 byte length. `String.length` counts UTF-16 units and is not this. */
export function utf8ByteLength(text: string): number {
  return encoder.encode(text).length;
}

function decodeHex(text: string): Uint8Array | null {
  const compact = text.replace(/\s+/g, "");
  if (!HEX.test(compact) || compact.length % 2 !== 0) return null;

  const bytes = new Uint8Array(compact.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(compact.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function decodeBase64(text: string): Uint8Array | null {
  const compact = text.replace(/\s+/g, "");
  if (!BASE64.test(compact) || compact.length % 4 !== 0) return null;

  try {
    const binary = atob(compact);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  } catch {
    return null;
  }
}

/**
 * Decodes the raw value text into bytes according to the chosen encoding.
 *
 * Returns `null` for text that cannot be decoded, which the caller turns into
 * `invalid_encoding`. An empty string is a legitimate zero-byte value, not a
 * failure — that distinction is the point of the whole tool.
 */
export function decodeValue(text: string, encoding: ValueEncoding): Uint8Array | null {
  if (encoding === "utf8") return encoder.encode(text);
  if (encoding === "hex") return decodeHex(text);
  return decodeBase64(text);
}

/**
 * Validates the workbench inputs.
 *
 * Both bounds are checked in **bytes**. The SDK's own guard on the name uses
 * `String.length`, so a 64-character multibyte name passes it and then fails
 * deep inside the XDR writer with `got 64 bytes, max allowed is 64` — a
 * message that reads like a contradiction. Measuring here is what turns that
 * into `name_too_long` with a byte count the user can act on.
 */
export function parseManageDataInput({
  mode,
  name,
  value,
  encoding
}: RawManageDataInput): Result<ManageDataInput, ManageDataErrorCode, InputRejectionReason> {
  if (!name) return err("empty_input");
  if (name.length > MAX_RAW_LENGTH || value.length > MAX_RAW_LENGTH) {
    return err("input_too_large");
  }

  // A secret seed is refused in either field on the `S` prefix alone. This
  // tool's whole output is an operation meant to go on-chain, where a data
  // entry is public forever — so of everywhere in this app, here is where a
  // pasted seed must never be encoded, echoed or kept.
  if (SECRET_SEED.test(name.trim()) || SECRET_SEED.test(value.trim())) {
    return err("invalid_input", "secret_key");
  }

  if (utf8ByteLength(name) > MAX_NAME_BYTES) return err("name_too_long");

  // A delete carries no value at all, so the value field is not even read.
  if (mode === "delete") return ok({ mode, name, valueBytes: null, encoding });

  const valueBytes = decodeValue(value, encoding);
  if (valueBytes === null) return err("invalid_encoding");
  if (valueBytes.length > MAX_VALUE_BYTES) return err("value_too_long");

  return ok({ mode, name, valueBytes, encoding });
}

/** Guards against a mode the UI should never produce. */
export function isManageDataMode(value: string): value is ManageDataMode {
  return value === "set" || value === "delete";
}

export function isValueEncoding(value: string): value is ValueEncoding {
  return value === "utf8" || value === "hex" || value === "base64";
}

/** Reports which bound a length failure belongs to, for field-level messaging. */
export function lengthFieldFor(code: ManageDataErrorCode): "name" | "value" | null {
  if (code === "name_too_long") return "name";
  if (code === "value_too_long" || code === "invalid_encoding") return "value";
  return null;
}
