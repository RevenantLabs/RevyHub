import { Operation, xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  ByteView,
  DecodedPreview,
  ManageDataEntry,
  ManageDataErrorCode,
  ManageDataInput,
  NameView
} from "@/features/manage-data-codec/types";

const encoder = new TextEncoder();

const C0_END = 0x1f;
const DEL = 0x7f;
const C1_END = 0x9f;

/**
 * C0 controls, DEL and the C1 range — never safe to render as themselves.
 *
 * Tested by code point rather than with a regex literal: a regex containing
 * raw control characters is invisible in a diff and easy for an editor to
 * mangle, and the escaped form is easy to get subtly wrong.
 */
export function isControlCodePoint(code: number): boolean {
  return code <= C0_END || (code >= DEL && code <= C1_END);
}

export function hasControlCharacters(text: string): boolean {
  for (const character of text) {
    if (isControlCodePoint(character.codePointAt(0) ?? 0)) return true;
  }
  return false;
}

/**
 * Replaces control characters with a printable escape.
 *
 * A raw control byte rendered into the page can move the cursor, blank the
 * line or hide what follows it — which would misrepresent the very bytes the
 * user came here to inspect.
 */
export function escapeControlCharacters(text: string): string {
  let escaped = "";

  for (const character of text) {
    const code = character.codePointAt(0) ?? 0;
    escaped += isControlCodePoint(code)
      ? `\\u${code.toString(16).padStart(4, "0")}`
      : character;
  }

  return escaped;
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/**
 * Decodes bytes as UTF-8 only when the decoding is lossless.
 *
 * `TextDecoder` without `fatal` silently substitutes U+FFFD for anything it
 * cannot read, which would show characters that are not in the data. Decoding
 * strictly *and* re-encoding to compare is the only way to know the text is a
 * faithful reading of these exact bytes.
 */
export function decodeUtf8Lossless(bytes: Uint8Array): string | null {
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const roundTrip = encoder.encode(text);

    if (roundTrip.length !== bytes.length) return null;
    for (let index = 0; index < bytes.length; index += 1) {
      if (roundTrip[index] !== bytes[index]) return null;
    }
    return text;
  } catch {
    return null;
  }
}

export function describeBytes(bytes: Uint8Array): ByteView {
  const text = decodeUtf8Lossless(bytes);

  return {
    byteLength: bytes.length,
    hex: toHex(bytes),
    base64: toBase64(bytes),
    // Control characters are escaped rather than dropped: the text is still
    // shown, but it cannot act on the page it is rendered into.
    text: text === null ? null : escapeControlCharacters(text),
    textLossless: text !== null,
    hasControlBytes: text !== null && hasControlCharacters(text)
  };
}

export function describeName(name: string): NameView {
  const bytes = encoder.encode(name);

  return {
    text: name,
    byteLength: bytes.length,
    characterLength: name.length,
    hex: toHex(bytes)
  };
}

/**
 * Reads the generated XDR back out rather than echoing the form.
 *
 * The whole claim of this tool is "these are the bytes you will get", so the
 * preview is decoded from the operation itself. If the SDK ever encoded
 * something other than what was asked for, this panel would show it.
 */
export function decodeOperation(operationXdr: string): DecodedPreview {
  const operation = xdr.Operation.fromXDR(operationXdr, "base64");
  const manageData = operation.body().manageDataOp();
  const value = manageData.dataValue();

  return {
    name: manageData.dataName().toString(),
    // The optional is absent for a delete and present — possibly zero-length —
    // for a set. That is the entire distinction this tool exists to show.
    valuePresent: value !== null && value !== undefined,
    valueHex: value ? toHex(new Uint8Array(value)) : null,
    valueByteLength: value ? value.length : null
  };
}

/**
 * Builds a standalone unsigned manage-data operation.
 *
 * No transaction is constructed: there is no source account, sequence, fee or
 * signature here, and nothing that could be submitted by accident.
 */
export function buildManageData({
  mode,
  name,
  valueBytes
}: ManageDataInput): Result<ManageDataEntry, ManageDataErrorCode> {
  let operationXdr: string;

  try {
    const operation = Operation.manageData({
      name,
      // `null` is the delete discriminator. A zero-length Buffer is a present
      // value of zero bytes — a different operation entirely.
      value: mode === "delete" ? null : Buffer.from(valueBytes ?? new Uint8Array())
    });
    operationXdr = operation.toXDR("base64");
  } catch {
    // The schema has already enforced both byte bounds, so anything reaching
    // here is an encoding the SDK refuses for a reason the input did not show.
    return err("invalid_input");
  }

  try {
    return ok({
      mode,
      name: describeName(name),
      value: mode === "delete" ? null : describeBytes(valueBytes ?? new Uint8Array()),
      operationXdr,
      decoded: decodeOperation(operationXdr)
    });
  } catch {
    return err("invalid_input");
  }
}
