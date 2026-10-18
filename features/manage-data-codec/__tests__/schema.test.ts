import { describe, expect, it } from "vitest";
import {
  MAX_NAME_BYTES,
  MAX_RAW_LENGTH,
  MAX_VALUE_BYTES,
  decodeValue,
  isManageDataMode,
  isValueEncoding,
  lengthFieldFor,
  parseManageDataInput,
  utf8ByteLength
} from "@/features/manage-data-codec/schema";
import {
  asciiNameAtLimit,
  asciiNameOverLimit,
  base64Value,
  hexValueAtLimit,
  hexValueOverLimit,
  malformedBase64,
  multibyteNameAtLimit,
  multibyteNameOverLimit,
  nonHexValue,
  oddLengthHex,
  oversizedRawValue,
  secretSeed,
  simpleName,
  simpleValue
} from "@/features/manage-data-codec/fixtures/manageDataCodec.fixture";

const base = { mode: "set", name: simpleName, value: simpleValue, encoding: "utf8" } as const;

/**
 * Compares byte contents rather than instances.
 *
 * `TextEncoder` and the test realm produce `Uint8Array`s with different
 * prototypes under jsdom, so a structural `toEqual` fails on two arrays that
 * hold identical bytes.
 */
const bytes = (value: Uint8Array | null) => (value === null ? null : Array.from(value));

describe("utf8ByteLength", () => {
  it("counts bytes, not UTF-16 units", () => {
    expect(utf8ByteLength("abc")).toBe(3);
    expect(utf8ByteLength("é")).toBe(2);
    expect(utf8ByteLength("🦝")).toBe(4);
    // The trap this whole tool exists around: 64 characters, 128 bytes.
    expect(multibyteNameOverLimit.length).toBe(64);
    expect(utf8ByteLength(multibyteNameOverLimit)).toBe(128);
  });
});

describe("parseManageDataInput", () => {
  it("requires a name in both modes", () => {
    expect(parseManageDataInput({ ...base, name: "" })).toEqual({
      ok: false,
      code: "empty_input"
    });
    expect(parseManageDataInput({ ...base, mode: "delete", name: "" })).toEqual({
      ok: false,
      code: "empty_input"
    });
  });

  it("accepts an empty value as a zero-byte value, not as missing input", () => {
    const result = parseManageDataInput({ ...base, value: "" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.valueBytes).not.toBeNull();
    expect(bytes(result.value.valueBytes)).toEqual([]);
  });

  it("accepts a name exactly at the byte limit in either script", () => {
    expect(parseManageDataInput({ ...base, name: asciiNameAtLimit }).ok).toBe(true);
    expect(parseManageDataInput({ ...base, name: multibyteNameAtLimit }).ok).toBe(true);
  });

  it("rejects a name one byte over the limit", () => {
    expect(parseManageDataInput({ ...base, name: asciiNameOverLimit })).toEqual({
      ok: false,
      code: "name_too_long"
    });
  });

  it("rejects a multibyte name that is short in characters but long in bytes", () => {
    // 64 characters would pass a `String.length` check, and the SDK's own
    // guard uses exactly that before failing opaquely in the XDR writer.
    expect(multibyteNameOverLimit.length).toBeLessThanOrEqual(MAX_NAME_BYTES);
    expect(parseManageDataInput({ ...base, name: multibyteNameOverLimit })).toEqual({
      ok: false,
      code: "name_too_long"
    });
  });

  it("accepts a value exactly at the byte limit and rejects one over", () => {
    expect(
      parseManageDataInput({ ...base, value: hexValueAtLimit, encoding: "hex" }).ok
    ).toBe(true);
    expect(parseManageDataInput({ ...base, value: hexValueOverLimit, encoding: "hex" })).toEqual({
      ok: false,
      code: "value_too_long"
    });
  });

  it("measures the value after decoding, not as typed", () => {
    // 128 hex characters decode to 64 bytes — over the limit only if you
    // measure the text instead of the bytes.
    expect(hexValueAtLimit.length).toBeGreaterThan(MAX_VALUE_BYTES);
    expect(parseManageDataInput({ ...base, value: hexValueAtLimit, encoding: "hex" }).ok).toBe(
      true
    );
  });

  it("rejects hex that cannot be decoded", () => {
    expect(parseManageDataInput({ ...base, value: oddLengthHex, encoding: "hex" })).toEqual({
      ok: false,
      code: "invalid_encoding"
    });
    expect(parseManageDataInput({ ...base, value: nonHexValue, encoding: "hex" })).toEqual({
      ok: false,
      code: "invalid_encoding"
    });
  });

  it("rejects base64 that cannot be decoded", () => {
    expect(parseManageDataInput({ ...base, value: malformedBase64, encoding: "base64" })).toEqual(
      { ok: false, code: "invalid_encoding" }
    );
  });

  it("never reads the value field in delete mode", () => {
    // Even an undecodable value is irrelevant to a deletion.
    const result = parseManageDataInput({
      ...base,
      mode: "delete",
      value: nonHexValue,
      encoding: "hex"
    });

    expect(result.ok).toBe(true);
    expect(result.ok && result.value.valueBytes).toBeNull();
  });

  it("refuses a secret seed in either field without echoing it", () => {
    const inName = parseManageDataInput({ ...base, name: secretSeed });
    const inValue = parseManageDataInput({ ...base, value: secretSeed });

    expect(inName).toEqual({ ok: false, code: "invalid_input", detail: "secret_key" });
    expect(inValue).toEqual({ ok: false, code: "invalid_input", detail: "secret_key" });
    expect(JSON.stringify([inName, inValue])).not.toContain(secretSeed);
  });

  it("flags only a secret seed for redaction, not any other bad input", () => {
    const badEncoding = parseManageDataInput({ ...base, value: nonHexValue, encoding: "hex" });
    expect(badEncoding.ok === false && badEncoding.detail).toBeUndefined();
  });

  it("rejects raw text past the processing cap before decoding it", () => {
    expect(parseManageDataInput({ ...base, value: oversizedRawValue })).toEqual({
      ok: false,
      code: "input_too_large"
    });
    expect(oversizedRawValue.length).toBeGreaterThan(MAX_RAW_LENGTH);
  });
});

describe("decodeValue", () => {
  it("encodes UTF-8 text to its bytes", () => {
    expect(bytes(decodeValue("é", "utf8"))).toEqual([0xc3, 0xa9]);
  });

  it("decodes hex and base64 to the same bytes", () => {
    expect(bytes(decodeValue("010203", "hex"))).toEqual([1, 2, 3]);
    expect(bytes(decodeValue(base64Value, "base64"))).toEqual([1, 2, 3]);
  });

  it("tolerates whitespace inside hex and base64", () => {
    expect(bytes(decodeValue("01 02 03", "hex"))).toEqual([1, 2, 3]);
    expect(bytes(decodeValue("AQ ID", "base64"))).toEqual([1, 2, 3]);
  });

  it("treats empty text as zero bytes in every encoding", () => {
    expect(bytes(decodeValue("", "utf8"))).toEqual([]);
    expect(bytes(decodeValue("", "hex"))).toEqual([]);
    expect(bytes(decodeValue("", "base64"))).toEqual([]);
  });

  it("returns null for text that is not that encoding", () => {
    expect(decodeValue(oddLengthHex, "hex")).toBeNull();
    expect(decodeValue(malformedBase64, "base64")).toBeNull();
  });
});

describe("guards", () => {
  it("accepts only the known modes and encodings", () => {
    expect(isManageDataMode("set")).toBe(true);
    expect(isManageDataMode("destroy")).toBe(false);
    expect(isValueEncoding("base64")).toBe(true);
    expect(isValueEncoding("ascii")).toBe(false);
  });

  it("points each length failure at the field it came from", () => {
    expect(lengthFieldFor("name_too_long")).toBe("name");
    expect(lengthFieldFor("value_too_long")).toBe("value");
    expect(lengthFieldFor("invalid_encoding")).toBe("value");
    expect(lengthFieldFor("empty_input")).toBeNull();
  });
});
