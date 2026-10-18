import { xdr } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";
import {
  buildManageData,
  decodeUtf8Lossless,
  describeBytes,
  describeName,
  escapeControlCharacters,
  hasControlCharacters,
  isControlCodePoint,
  toBase64,
  toHex
} from "@/features/manage-data-codec/lib/manageDataCodec";
import { decodeValue, parseManageDataInput } from "@/features/manage-data-codec/schema";
import {
  asciiNameAtLimit,
  base64Value,
  binaryHexValue,
  byteLengthOf,
  controlBytesHexValue,
  emojiName,
  hexValueAtLimit,
  multibyteNameAtLimit,
  simpleName,
  simpleValue
} from "@/features/manage-data-codec/fixtures/manageDataCodec.fixture";

/**
 * Control characters are built from their code points rather than written as
 * literals: a raw NUL in a source file is invisible in a diff and easily lost
 * to a copy or a formatter.
 */
const chr = (code: number) => String.fromCharCode(code);
const NUL = chr(0x00);
const DEL = chr(0x7f);
const C1 = chr(0x9f);
const NBSP = chr(0xa0);

function build(
  overrides: Partial<{
    mode: "set" | "delete";
    name: string;
    value: string;
    encoding: "utf8" | "hex" | "base64";
  }> = {}
) {
  const parsed = parseManageDataInput({
    mode: "set",
    name: simpleName,
    value: simpleValue,
    encoding: "utf8",
    ...overrides
  });
  if (!parsed.ok) throw new Error(`fixture failed to parse: ${parsed.code}`);
  return buildManageData(parsed.value);
}

/** Reads the raw XDR directly, independently of the tool's own preview. */
function rawValuePresent(operationXdr: string): boolean {
  const value = xdr.Operation.fromXDR(operationXdr, "base64").body().manageDataOp().dataValue();
  return value !== null && value !== undefined;
}

describe("buildManageData", () => {
  it("builds a standalone operation, not a transaction", () => {
    const result = build();

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const operation = xdr.Operation.fromXDR(result.value.operationXdr, "base64");
    expect(operation.body().switch().name).toBe("manageData");
    // It is an operation, not an envelope: there is no transaction around it.
    expect(() =>
      xdr.TransactionEnvelope.fromXDR(result.value.operationXdr, "base64")
    ).toThrow();
  });

  it("round-trips the name and value out of the XDR it produced", () => {
    const result = build();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.decoded.name).toBe(simpleName);
    expect(result.value.decoded.valuePresent).toBe(true);
    expect(result.value.decoded.valueHex).toBe(toHex(new TextEncoder().encode(simpleValue)));
    expect(result.value.decoded.valueByteLength).toBe(byteLengthOf(simpleValue));
  });

  it("distinguishes a delete from a zero-byte value in the XDR itself", () => {
    const deletion = build({ mode: "delete" });
    const emptySet = build({ mode: "set", value: "" });

    expect(deletion.ok && emptySet.ok).toBe(true);
    if (!deletion.ok || !emptySet.ok) return;

    // Not just different labels — different bytes.
    expect(deletion.value.operationXdr).not.toBe(emptySet.value.operationXdr);
    expect(rawValuePresent(deletion.value.operationXdr)).toBe(false);
    expect(rawValuePresent(emptySet.value.operationXdr)).toBe(true);

    expect(deletion.value.decoded.valuePresent).toBe(false);
    expect(deletion.value.decoded.valueByteLength).toBeNull();
    expect(deletion.value.value).toBeNull();

    expect(emptySet.value.decoded.valuePresent).toBe(true);
    expect(emptySet.value.decoded.valueByteLength).toBe(0);
    expect(emptySet.value.value?.byteLength).toBe(0);
  });

  it("ignores the value field entirely in delete mode", () => {
    const withValue = build({ mode: "delete", value: "ignored" });
    const withoutValue = build({ mode: "delete", value: "" });

    expect(withValue.ok && withoutValue.ok).toBe(true);
    if (!withValue.ok || !withoutValue.ok) return;
    expect(withValue.value.operationXdr).toBe(withoutValue.value.operationXdr);
  });

  it("produces the same bytes from every encoding of the same value", () => {
    const fromHex = build({ value: "010203", encoding: "hex" });
    const fromBase64 = build({ value: base64Value, encoding: "base64" });

    expect(fromHex.ok && fromBase64.ok).toBe(true);
    if (!fromHex.ok || !fromBase64.ok) return;
    expect(fromHex.value.operationXdr).toBe(fromBase64.value.operationXdr);
    expect(fromHex.value.value?.hex).toBe("010203");
  });

  it("accepts a multibyte name that is exactly 64 bytes", () => {
    const result = build({ name: multibyteNameAtLimit });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.name.byteLength).toBe(64);
    // 32 characters, 64 bytes — a character count would call this half full.
    expect(result.value.name.characterLength).toBe(32);
    expect(result.value.decoded.name).toBe(multibyteNameAtLimit);
  });

  it("accepts an ASCII name exactly at the limit", () => {
    const result = build({ name: asciiNameAtLimit });
    expect(result.ok && result.value.name.byteLength).toBe(64);
  });

  it("accepts a value exactly at the 64-byte limit", () => {
    const result = build({ value: hexValueAtLimit, encoding: "hex" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.value?.byteLength).toBe(64);
  });

  it("counts a four-byte character as four bytes", () => {
    const result = build({ name: emojiName });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.name.byteLength).toBe(4);
    expect(result.value.name.characterLength).toBe(2);
  });
});

describe("describeBytes", () => {
  it("shows hex and base64 for every value", () => {
    expect(describeBytes(new Uint8Array([1, 2, 3]))).toMatchObject({
      byteLength: 3,
      hex: "010203",
      base64: "AQID"
    });
  });

  it("refuses to render text for bytes that are not valid UTF-8", () => {
    const parsed = decodeValue(binaryHexValue, "hex");
    expect(parsed).not.toBeNull();
    if (!parsed) return;

    const view = describeBytes(parsed);
    expect(view.textLossless).toBe(false);
    // Inventing replacement characters would show data that is not there.
    expect(view.text).toBeNull();
    expect(view.hex).toBe(binaryHexValue);
  });

  it("escapes control characters rather than rendering them", () => {
    const parsed = decodeValue(controlBytesHexValue, "hex");
    expect(parsed).not.toBeNull();
    if (!parsed) return;

    const view = describeBytes(parsed);
    expect(view.textLossless).toBe(true);
    expect(view.hasControlBytes).toBe(true);
    expect(view.text).toBe("A\\u0000B");
    // The raw NUL must not survive into anything rendered.
    expect(view.text?.includes(NUL)).toBe(false);
  });

  it("describes a zero-byte value without calling it absent", () => {
    expect(describeBytes(new Uint8Array())).toMatchObject({
      byteLength: 0,
      hex: "",
      base64: "",
      textLossless: true
    });
  });
});

describe("decodeUtf8Lossless", () => {
  it("returns text only when re-encoding reproduces the exact bytes", () => {
    expect(decodeUtf8Lossless(new TextEncoder().encode("héllo"))).toBe("héllo");
    expect(decodeUtf8Lossless(new Uint8Array([0xff, 0xfe]))).toBeNull();
  });

  it("treats an empty input as empty text, not as a failure", () => {
    expect(decodeUtf8Lossless(new Uint8Array())).toBe("");
  });
});

describe("isControlCodePoint", () => {
  it("covers C0, DEL and C1", () => {
    expect(isControlCodePoint(0x00)).toBe(true);
    expect(isControlCodePoint(0x1f)).toBe(true);
    expect(isControlCodePoint(0x7f)).toBe(true);
    expect(isControlCodePoint(0x9f)).toBe(true);
  });

  it("stops at the boundaries rather than swallowing printable characters", () => {
    expect(isControlCodePoint(0x20)).toBe(false);
    expect(isControlCodePoint(0x7e)).toBe(false);
    expect(isControlCodePoint(0xa0)).toBe(false);
  });
});

describe("escapeControlCharacters", () => {
  it("leaves ordinary text untouched", () => {
    expect(escapeControlCharacters("hello")).toBe("hello");
  });

  it("escapes C0, DEL and C1 characters", () => {
    expect(escapeControlCharacters(`a${NUL}b`)).toBe("a\\u0000b");
    expect(escapeControlCharacters(`a${DEL}b`)).toBe("a\\u007fb");
    expect(escapeControlCharacters(`a${C1}b`)).toBe("a\\u009fb");
  });

  it("does not escape a printable character just above the C1 range", () => {
    expect(hasControlCharacters(`a${NBSP}b`)).toBe(false);
    expect(escapeControlCharacters(`a${NBSP}b`)).toBe(`a${NBSP}b`);
  });
});

describe("describeName", () => {
  it("reports byte length and character length separately", () => {
    expect(describeName("é")).toMatchObject({ byteLength: 2, characterLength: 1, hex: "c3a9" });
  });
});

describe("toHex and toBase64", () => {
  it("pad single-digit bytes", () => {
    expect(toHex(new Uint8Array([0, 15, 255]))).toBe("000fff");
  });

  it("encode an empty array to an empty string", () => {
    expect(toHex(new Uint8Array())).toBe("");
    expect(toBase64(new Uint8Array())).toBe("");
  });
});
