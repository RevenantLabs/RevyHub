import { err, ok, type Result } from "@/core/result/result";
import {
  concatBytes,
  fromBase64,
  paddingLength,
  readUint32,
  readUint64,
  toBase64,
  toHex,
  uint32Bytes,
  uint64Bytes,
  utf8Text
} from "@/features/memo-inspector/lib/bytes";
import type {
  DecodedMemo,
  MemoEncoding,
  MemoErrorCode,
  MemoInput,
  MemoKind,
  MemoSegment
} from "@/features/memo-inspector/types";

/**
 * The memo codec, written directly against the XDR definition:
 *
 * ```
 * union Memo switch (MemoType type) {
 * case MEMO_NONE:   void;
 * case MEMO_TEXT:   string text<28>;
 * case MEMO_ID:     uint64 id;
 * case MEMO_HASH:   Hash hash;
 * case MEMO_RETURN: Hash retHash;
 * };
 * ```
 *
 * It is written by hand rather than delegated to the SDK so the tool can show
 * *where* each byte comes from — the discriminant, the length prefix, the value
 * and the XDR padding. `memoInspector.test.ts` checks every variant against the
 * SDK's own encoder, so the hand-written path stays honest.
 */

/** A text memo holds 28 bytes. That is a byte budget, not a character budget. */
export const TEXT_MAX_BYTES = 28;
/** `Hash` is a fixed 32-byte opaque, used by both MEMO_HASH and MEMO_RETURN. */
export const HASH_BYTES = 32;
/** The largest value a `uint64` memo id can hold. */
export const MAX_MEMO_ID = 2n ** 64n - 1n;

export const MEMO_TYPE_NAMES: Record<MemoKind, string> = {
  none: "MEMO_NONE",
  text: "MEMO_TEXT",
  id: "MEMO_ID",
  hash: "MEMO_HASH",
  return: "MEMO_RETURN"
};

export const MEMO_TYPE_VALUES: Record<MemoKind, number> = {
  none: 0,
  text: 1,
  id: 2,
  hash: 3,
  return: 4
};

const KIND_OF_TYPE_VALUE: Record<number, MemoKind> = {
  0: "none",
  1: "text",
  2: "id",
  3: "hash",
  4: "return"
};

function segment(part: MemoSegment["part"], bytes: Uint8Array): MemoSegment {
  return { part, hex: toHex(bytes), byteLength: bytes.length };
}

/**
 * Encodes a validated memo into its XDR bytes.
 *
 * Never throws: the only failure it can report is a kind it does not know,
 * which `schema.ts` already rejects.
 */
export function encodeMemo(input: MemoInput): Result<MemoEncoding, MemoErrorCode> {
  const kind = input.kind;
  const discriminant = uint32Bytes(MEMO_TYPE_VALUES[kind]);
  const segments: MemoSegment[] = [segment("discriminant", discriminant)];

  // Annotated rather than inferred: the bytes assigned below come from
  // `MemoInput` and `concatBytes`, whose buffers are `ArrayBufferLike`.
  let body: Uint8Array = new Uint8Array(0);
  let payloadByteLength = 0;
  let displayValue: string | null = null;

  switch (input.kind) {
    case "none":
      break;

    case "text": {
      const length = uint32Bytes(input.bytes.length);
      const padding = new Uint8Array(paddingLength(input.bytes.length));

      body = concatBytes(length, input.bytes, padding);
      payloadByteLength = input.bytes.length;
      displayValue = input.text;

      segments.push(segment("length", length));
      segments.push(segment("value", input.bytes));
      if (padding.length) segments.push(segment("padding", padding));
      break;
    }

    case "id": {
      body = uint64Bytes(input.id);
      payloadByteLength = body.length;
      displayValue = input.id.toString();
      segments.push(segment("value", body));
      break;
    }

    case "hash":
    case "return": {
      body = input.hash;
      payloadByteLength = body.length;
      displayValue = toHex(input.hash);
      segments.push(segment("value", body));
      break;
    }

    default:
      // Unreachable for a validated `MemoInput`; kept so a future memo variant
      // fails as a value rather than silently encoding as MEMO_NONE.
      return err("unsupported_type");
  }

  const xdr = concatBytes(discriminant, body);

  return ok({
    kind,
    typeName: MEMO_TYPE_NAMES[kind],
    typeValue: MEMO_TYPE_VALUES[kind],
    xdrBase64: toBase64(xdr),
    xdrHex: toHex(xdr),
    xdrByteLength: xdr.length,
    payloadByteLength,
    segments,
    displayValue
  });
}

/**
 * Reads memo XDR back into a value, so an encoding can be proved round-trip
 * safe and pasted XDR can be inspected.
 */
export function decodeMemo(xdrBase64: string): Result<DecodedMemo, MemoErrorCode> {
  const bytes = fromBase64(xdrBase64);
  if (!bytes) return err("decode_failed");
  if (bytes.length < 4) return err("decode_failed");

  const kind = KIND_OF_TYPE_VALUE[readUint32(bytes, 0)];
  if (!kind) return err("unsupported_type");

  const typeName = MEMO_TYPE_NAMES[kind];
  const body = bytes.subarray(4);

  if (kind === "none") {
    if (body.length !== 0) return err("decode_failed");
    return ok({ kind, typeName, value: null, payloadHex: null, payloadByteLength: 0 });
  }

  if (kind === "text") {
    if (body.length < 4) return err("decode_failed");

    const length = readUint32(body, 0);
    if (length > TEXT_MAX_BYTES) return err("text_too_long");
    if (body.length !== 4 + length + paddingLength(length)) return err("decode_failed");

    const valueBytes = body.subarray(4, 4 + length);
    const text = utf8Text(valueBytes);
    if (text === null) return err("decode_failed");

    return ok({
      kind,
      typeName,
      value: text,
      payloadHex: toHex(valueBytes),
      payloadByteLength: length
    });
  }

  if (kind === "id") {
    if (body.length !== 8) return err("decode_failed");
    return ok({
      kind,
      typeName,
      value: readUint64(body, 0).toString(),
      payloadHex: toHex(body),
      payloadByteLength: 8
    });
  }

  if (body.length !== HASH_BYTES) return err("decode_failed");
  return ok({
    kind,
    typeName,
    value: toHex(body),
    payloadHex: toHex(body),
    payloadByteLength: HASH_BYTES
  });
}

/** Round-trips an encoding through the decoder, which is what the UI displays. */
export function inspectMemo(
  input: MemoInput
): Result<{ encoding: MemoEncoding; decoded: DecodedMemo }, MemoErrorCode> {
  const encoded = encodeMemo(input);
  if (!encoded.ok) return encoded;

  const decoded = decodeMemo(encoded.value.xdrBase64);
  if (!decoded.ok) return decoded;

  return ok({ encoding: encoded.value, decoded: decoded.value });
}
