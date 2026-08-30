/** The five memo variants of the XDR `Memo` union. */
export const MEMO_KINDS = ["none", "text", "id", "hash", "return"] as const;

export type MemoKind = (typeof MEMO_KINDS)[number];

/** How the user supplied a 32-byte hash. */
export type HashEncoding = "hex" | "base64";

/** A validated memo, ready to encode. Bytes are already decoded and checked. */
export type MemoInput =
  | { kind: "none" }
  | { kind: "text"; text: string; bytes: Uint8Array }
  | { kind: "id"; id: bigint }
  | { kind: "hash" | "return"; hash: Uint8Array; encoding: HashEncoding };

/**
 * The structural parts of an encoded memo. The codec names the parts; `copy.ts`
 * owns the words shown for each, so the byte layout stays translatable.
 */
export type MemoSegmentPart = "discriminant" | "length" | "value" | "padding";

/** One labelled run of bytes inside the encoded memo. */
export interface MemoSegment {
  part: MemoSegmentPart;
  hex: string;
  byteLength: number;
}

export interface MemoEncoding {
  kind: MemoKind;
  /** The XDR enum name, e.g. `MEMO_TEXT`. */
  typeName: string;
  /** The XDR enum discriminant, e.g. 1 for `MEMO_TEXT`. */
  typeValue: number;
  xdrBase64: string;
  xdrHex: string;
  xdrByteLength: number;
  /** Bytes contributed by the user's value, excluding discriminant and padding. */
  payloadByteLength: number;
  segments: MemoSegment[];
  /** The value as a transaction would carry it, or null for `MEMO_NONE`. */
  displayValue: string | null;
}

export interface DecodedMemo {
  kind: MemoKind;
  typeName: string;
  /** The decoded value, or null for `MEMO_NONE`. */
  value: string | null;
  /** Hex of the value's bytes, or null when the variant carries none. */
  payloadHex: string | null;
  payloadByteLength: number;
}

export type MemoErrorCode =
  | "empty_input"
  | "text_too_long"
  | "invalid_id"
  | "invalid_hash"
  | "unsupported_type"
  | "decode_failed";

/** The form control an error should be rendered against. */
export type MemoField = "kind" | "value";
