import { err, ok, type Result } from "@/core/result/result";
import { fromBase64, fromHex, utf8Bytes } from "@/features/memo-inspector/lib/bytes";
import {
  HASH_BYTES,
  MAX_MEMO_ID,
  TEXT_MAX_BYTES
} from "@/features/memo-inspector/lib/memoInspector";
import {
  MEMO_KINDS,
  type MemoErrorCode,
  type MemoField,
  type MemoInput,
  type MemoKind
} from "@/features/memo-inspector/types";

/** Decimal digits only: no sign, no exponent, no separators. */
const UNSIGNED_INTEGER = /^\d+$/;

export interface RawMemoForm {
  /** Typed as `string`, not `MemoKind`, so an unknown type is a value we reject. */
  kind: string;
  value: string;
}

export const FIELD_OF_CODE: Record<MemoErrorCode, MemoField | null> = {
  empty_input: "value",
  text_too_long: "value",
  invalid_id: "value",
  invalid_hash: "value",
  unsupported_type: "kind",
  decode_failed: null
};

export function isMemoKind(value: string): value is MemoKind {
  return (MEMO_KINDS as readonly string[]).includes(value);
}

/** True when a memo variant needs a value from the user. `none` does not. */
export function requiresValue(kind: MemoKind): boolean {
  return kind !== "none";
}

/**
 * Parses a 32-byte hash written as hex or as base64.
 *
 * Hex is tried first on purpose: 64 hex characters are also a syntactically
 * valid base64 string, but they decode to 48 unrelated bytes.
 */
export function parseHashBytes(
  raw: string
): Result<{ hash: Uint8Array; encoding: "hex" | "base64" }, MemoErrorCode> {
  const value = raw.replace(/\s+/g, "");
  if (!value) return err("empty_input");

  const hex = fromHex(value);
  if (hex) {
    return hex.length === HASH_BYTES ? ok({ hash: hex, encoding: "hex" }) : err("invalid_hash");
  }

  const base64 = fromBase64(value);
  if (base64 && base64.length === HASH_BYTES) return ok({ hash: base64, encoding: "base64" });

  return err("invalid_hash");
}

/** Parses the memo id as an unsigned 64-bit integer, using BigInt throughout. */
export function parseMemoId(raw: string): Result<bigint, MemoErrorCode> {
  const value = raw.trim();
  if (!value) return err("empty_input");
  if (!UNSIGNED_INTEGER.test(value)) return err("invalid_id");

  const id = BigInt(value);
  if (id > MAX_MEMO_ID) return err("invalid_id");

  return ok(id);
}

/** Parses raw form input into a memo ready to encode, without ever throwing. */
export function parseMemoForm(raw: RawMemoForm): Result<MemoInput, MemoErrorCode> {
  if (!isMemoKind(raw.kind)) return err("unsupported_type");

  if (raw.kind === "none") return ok({ kind: "none" });

  if (raw.kind === "text") {
    // Only the outer whitespace is dropped: spaces inside a memo are part of
    // the payload, but a trailing newline from a paste is never intended.
    const text = raw.value.trim();
    if (!text) return err("empty_input");

    const bytes = utf8Bytes(text);
    if (bytes.length > TEXT_MAX_BYTES) return err("text_too_long");

    return ok({ kind: "text", text, bytes });
  }

  if (raw.kind === "id") {
    const id = parseMemoId(raw.value);
    return id.ok ? ok({ kind: "id", id: id.value }) : id;
  }

  const hash = parseHashBytes(raw.value);
  return hash.ok
    ? ok({ kind: raw.kind, hash: hash.value.hash, encoding: hash.value.encoding })
    : hash;
}
