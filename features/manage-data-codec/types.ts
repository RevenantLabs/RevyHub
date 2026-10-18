export type ManageDataErrorCode =
  | "empty_input"
  | "invalid_input"
  | "input_too_large"
  | "name_too_long"
  | "value_too_long"
  | "invalid_encoding";

/**
 * Setting a value and deleting the entry are different operations, not two
 * shades of the same one — the XDR carries an absent value for a delete and a
 * present, possibly zero-length, value for a set.
 */
export type ManageDataMode = "set" | "delete";

export type ValueEncoding = "utf8" | "hex" | "base64";

/** Which field a length problem came from, so the UI can point at it. */
export type LengthField = "name" | "value";

/**
 * Why an `invalid_input` was rejected, when the reason changes what the UI
 * must do rather than only what it says.
 *
 * `secret_key` is the only such reason: the pasted text has to be cleared from
 * the field, not merely refused.
 */
export type InputRejectionReason = "secret_key";

export interface ByteView {
  byteLength: number;
  hex: string;
  base64: string;
  /**
   * The UTF-8 reading of these bytes, only when decoding is lossless and the
   * result is safe to render. `null` means "show the hex instead".
   */
  text: string | null;
  /** True when the bytes decode to UTF-8 and re-encode back to the same bytes. */
  textLossless: boolean;
  /** True when the bytes contain C0/C1 control characters or a lone DEL. */
  hasControlBytes: boolean;
}

export interface NameView {
  text: string;
  /** UTF-8 byte length — the bound the protocol actually enforces. */
  byteLength: number;
  /** JavaScript string length, shown only to make the difference visible. */
  characterLength: number;
  hex: string;
}

/** What the generated XDR decodes back to, read from the XDR itself. */
export interface DecodedPreview {
  name: string;
  /** False for a delete; true for a set, including a zero-length value. */
  valuePresent: boolean;
  valueHex: string | null;
  valueByteLength: number | null;
}

export interface ManageDataEntry {
  mode: ManageDataMode;
  name: NameView;
  /** `null` for a delete. A zero-byte set has a view with `byteLength: 0`. */
  value: ByteView | null;
  /** Standalone unsigned manage-data operation XDR, base64. */
  operationXdr: string;
  decoded: DecodedPreview;
}

export interface ManageDataInput {
  mode: ManageDataMode;
  name: string;
  /** Decoded value bytes; absent for a delete. */
  valueBytes: Uint8Array | null;
  encoding: ValueEncoding;
}
