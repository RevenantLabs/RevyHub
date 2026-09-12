import { describe, expect, it, vi } from "vitest";
import {
  decodeInputBytes,
  fromBase64,
  fromHex,
  runHashCalculator,
  toBase64,
  toHex
} from "@/features/hash-calculator/lib/hashCalculator";
import {
  base64Vector,
  expectedPublicHashBase64,
  expectedPublicHashHex,
  expectedTestnetHashBase64,
  expectedTestnetHashHex,
  hexVector,
  invalidBase64,
  invalidHexChars,
  invalidHexOdd,
  invalidXdrString,
  secretKey,
  textVector,
  validEnvelopeXdr
} from "@/features/hash-calculator/fixtures/hashCalculator.fixture";

describe("runHashCalculator - raw data mode", () => {
  it("computes SHA-256 over utf-8 text", async () => {
    const result = await runHashCalculator({
      mode: "data",
      data: textVector.input,
      encoding: "utf8"
    });

    expect(result).toEqual({
      ok: true,
      value: {
        mode: "data",
        encoding: "utf8",
        inputByteLength: 5,
        hashHex: textVector.expectedHex,
        hashBase64: textVector.expectedBase64
      }
    });
  });

  it("computes SHA-256 over hexadecimal bytes", async () => {
    const result = await runHashCalculator({
      mode: "data",
      data: hexVector.input,
      encoding: "hex"
    });

    expect(result).toEqual({
      ok: true,
      value: {
        mode: "data",
        encoding: "hex",
        inputByteLength: 4,
        hashHex: hexVector.expectedHex,
        hashBase64: hexVector.expectedBase64
      }
    });
  });

  it("computes SHA-256 over base64 bytes", async () => {
    const result = await runHashCalculator({
      mode: "data",
      data: base64Vector.input,
      encoding: "base64"
    });

    expect(result).toEqual({
      ok: true,
      value: {
        mode: "data",
        encoding: "base64",
        inputByteLength: 5,
        hashHex: base64Vector.expectedHex,
        hashBase64: base64Vector.expectedBase64
      }
    });
  });

  it("returns invalid_encoding when hex decoding fails", async () => {
    const result = await runHashCalculator({
      mode: "data",
      data: invalidHexOdd,
      encoding: "hex"
    });

    expect(result).toEqual({
      ok: false,
      code: "invalid_encoding"
    });
  });

  it("returns invalid_encoding when base64 decoding fails", async () => {
    const result = await runHashCalculator({
      mode: "data",
      data: invalidBase64,
      encoding: "base64"
    });

    expect(result).toEqual({
      ok: false,
      code: "invalid_encoding"
    });
  });
});

describe("runHashCalculator - transaction envelope mode", () => {
  it("derives transaction hash under testnet passphrase", async () => {
    const result = await runHashCalculator({
      mode: "transaction",
      envelope: validEnvelopeXdr,
      passphrasePreset: "testnet",
      resolvedPassphrase: "Test SDF Network ; September 2015"
    });

    expect(result.ok).toBe(true);
    if (!result.ok || result.value.mode !== "transaction") return;

    expect(result.value.mode).toBe("transaction");
    expect(result.value.selectedPreset).toBe("testnet");
    expect(result.value.hashHex).toBe(expectedTestnetHashHex);
    expect(result.value.hashBase64).toBe(expectedTestnetHashBase64);
    expect(result.value.testnetHashHex).toBe(expectedTestnetHashHex);
    expect(result.value.publicHashHex).toBe(expectedPublicHashHex);
    expect(result.value.hasDifferentStandardHashes).toBe(true);
    expect(result.value.envelopeType).toBe("Transaction");
    expect(result.value.operationCount).toBe(1);
  });

  it("derives transaction hash under public passphrase", async () => {
    const result = await runHashCalculator({
      mode: "transaction",
      envelope: validEnvelopeXdr,
      passphrasePreset: "public",
      resolvedPassphrase: "Public Global Stellar Network ; September 2015"
    });

    expect(result.ok).toBe(true);
    if (!result.ok || result.value.mode !== "transaction") return;

    expect(result.value.selectedPreset).toBe("public");
    expect(result.value.hashHex).toBe(expectedPublicHashHex);
    expect(result.value.hashBase64).toBe(expectedPublicHashBase64);
    expect(result.value.hashHex).not.toBe(expectedTestnetHashHex);
  });

  it("derives transaction hash under a custom passphrase", async () => {
    const result = await runHashCalculator({
      mode: "transaction",
      envelope: validEnvelopeXdr,
      passphrasePreset: "custom",
      customPassphrase: "Custom Private Stellar Net ; 2026",
      resolvedPassphrase: "Custom Private Stellar Net ; 2026"
    });

    expect(result.ok).toBe(true);
    if (!result.ok || result.value.mode !== "transaction") return;

    expect(result.value.selectedPreset).toBe("custom");
    expect(result.value.hashHex).not.toBe(expectedTestnetHashHex);
    expect(result.value.hashHex).not.toBe(expectedPublicHashHex);
  });

  it("returns invalid_xdr for non-envelope text", async () => {
    const result = await runHashCalculator({
      mode: "transaction",
      envelope: invalidXdrString,
      passphrasePreset: "testnet",
      resolvedPassphrase: "Test SDF Network ; September 2015"
    });

    expect(result).toEqual({
      ok: false,
      code: "invalid_xdr"
    });
  });

  it("returns invalid_xdr for secret keys passed as envelope", async () => {
    const result = await runHashCalculator({
      mode: "transaction",
      envelope: secretKey,
      passphrasePreset: "testnet",
      resolvedPassphrase: "Test SDF Network ; September 2015"
    });

    expect(result).toEqual({
      ok: false,
      code: "invalid_xdr"
    });
  });
});

describe("crypto_unavailable error path", () => {
  it("returns crypto_unavailable when Web Crypto digest is missing", async () => {
    const originalCrypto = globalThis.crypto;
    vi.stubGlobal("crypto", undefined);

    const result = await runHashCalculator({
      mode: "data",
      data: "test",
      encoding: "utf8"
    });

    expect(result).toEqual({
      ok: false,
      code: "crypto_unavailable"
    });

    vi.stubGlobal("crypto", originalCrypto);
  });
});

describe("byte helpers", () => {
  it("converts bytes to hex and hex to bytes", () => {
    const bytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    const hex = toHex(bytes);
    expect(hex).toBe("deadbeef");
    expect(fromHex(hex)).toEqual(bytes);
  });

  it("returns null for malformed hex", () => {
    expect(fromHex(invalidHexOdd)).toBeNull();
    expect(fromHex(invalidHexChars)).toBeNull();
    expect(fromHex("")).toBeNull();
  });

  it("converts bytes to base64 and base64 to bytes", () => {
    const bytes = new Uint8Array([104, 101, 108, 108, 111]);
    const b64 = toBase64(bytes);
    expect(b64).toBe("aGVsbG8=");
    expect(fromBase64(b64)).toEqual(bytes);
  });

  it("returns null for malformed base64", () => {
    expect(fromBase64(invalidBase64)).toBeNull();
    expect(fromBase64("")).toBeNull();
  });

  it("decodes input bytes according to selected encoding", () => {
    expect(decodeInputBytes("hello", "utf8")).toEqual({
      ok: true,
      value: new TextEncoder().encode("hello")
    });
    expect(decodeInputBytes("deadbeef", "hex").ok).toBe(true);
    expect(decodeInputBytes("aGVsbG8=", "base64").ok).toBe(true);
    expect(decodeInputBytes(invalidHexOdd, "hex")).toEqual({
      ok: false,
      code: "invalid_encoding"
    });
    expect(decodeInputBytes(invalidBase64, "base64")).toEqual({
      ok: false,
      code: "invalid_encoding"
    });
  });
});
