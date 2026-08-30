import { describe, expect, it } from "vitest";
import {
  byteLength,
  concatBytes,
  fromBase64,
  fromHex,
  paddingLength,
  readUint32,
  readUint64,
  toBase64,
  toHex,
  uint32Bytes,
  uint64Bytes,
  utf8Bytes,
  utf8Text
} from "@/features/memo-inspector/lib/bytes";
import {
  hashBase64,
  hashBase64Url,
  hashBytes,
  hashHex
} from "@/features/memo-inspector/fixtures/memoInspector.fixture";

describe("byteLength", () => {
  it("counts bytes, not characters", () => {
    expect(byteLength("abc")).toBe(3);
    expect("🚀".length).toBe(2);
    expect(byteLength("🚀")).toBe(4);
    expect(byteLength("é")).toBe(2);
  });

  it("is zero for the empty string", () => {
    expect(byteLength("")).toBe(0);
  });
});

describe("hex", () => {
  it("round-trips the fixture hash", () => {
    expect(toHex(hashBytes)).toBe(hashHex);
    expect(fromHex(hashHex)).toEqual(hashBytes);
  });

  it("accepts upper case and ignores whitespace", () => {
    expect(fromHex(" 00 FF ")).toEqual(new Uint8Array([0, 255]));
  });

  it("rejects odd lengths and non-hex characters", () => {
    expect(fromHex("abc")).toBeNull();
    expect(fromHex("zz")).toBeNull();
    expect(fromHex("")).toBeNull();
  });
});

describe("base64", () => {
  it("round-trips the fixture hash", () => {
    expect(toBase64(hashBytes)).toBe(hashBase64);
    expect(fromBase64(hashBase64)).toEqual(hashBytes);
  });

  it("accepts the URL-safe alphabet and missing padding", () => {
    expect(hashBase64Url).not.toBe(hashBase64);
    expect(fromBase64(hashBase64Url)).toEqual(hashBytes);
  });

  it("rejects a length that cannot be base64", () => {
    expect(fromBase64("AAAAA")).toBeNull();
    expect(fromBase64("")).toBeNull();
  });

  it("rejects characters outside the alphabet", () => {
    expect(fromBase64("!!!!")).toBeNull();
  });
});

describe("utf8Text", () => {
  it("decodes what utf8Bytes encoded", () => {
    expect(utf8Text(utf8Bytes("héllo 🚀"))).toBe("héllo 🚀");
  });

  it("returns null for bytes that are not valid UTF-8", () => {
    expect(utf8Text(new Uint8Array([0xff]))).toBeNull();
  });
});

describe("integers", () => {
  it("writes and reads a uint32 big-endian", () => {
    expect(toHex(uint32Bytes(1))).toBe("00000001");
    expect(readUint32(uint32Bytes(4294967295), 0)).toBe(4294967295);
  });

  it("writes and reads the full uint64 range with BigInt", () => {
    const max = 2n ** 64n - 1n;
    expect(toHex(uint64Bytes(max))).toBe("ffffffffffffffff");
    expect(readUint64(uint64Bytes(max), 0)).toBe(max);
    expect(readUint64(uint64Bytes(0n), 0)).toBe(0n);
  });

  it("survives values above Number.MAX_SAFE_INTEGER", () => {
    const value = 9007199254740993n;
    expect(readUint64(uint64Bytes(value), 0)).toBe(value);
  });

  it("reads an integer from a subarray, not from the start of the buffer", () => {
    const bytes = concatBytes(uint32Bytes(1), uint32Bytes(7));
    expect(readUint32(bytes.subarray(4), 0)).toBe(7);
  });
});

describe("paddingLength", () => {
  it("rounds a field up to a multiple of four", () => {
    expect([0, 1, 2, 3, 4, 5].map(paddingLength)).toEqual([0, 3, 2, 1, 0, 3]);
  });
});
