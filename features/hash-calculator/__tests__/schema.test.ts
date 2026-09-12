import { Networks } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";
import {
  isValidBase64,
  isValidHex,
  parseHashCalculatorInput,
  resolvePassphrase
} from "@/features/hash-calculator/schema";
import {
  invalidBase64,
  invalidHexChars,
  invalidHexOdd,
  secretKey,
  validEnvelopeXdr
} from "@/features/hash-calculator/fixtures/hashCalculator.fixture";

describe("parseHashCalculatorInput - string convenience input", () => {
  it("rejects empty or whitespace-only strings", () => {
    expect(parseHashCalculatorInput("")).toEqual({
      ok: false,
      code: "empty_input"
    });
    expect(parseHashCalculatorInput("   ")).toEqual({
      ok: false,
      code: "empty_input"
    });
  });

  it("parses non-empty string as utf8 data input", () => {
    expect(parseHashCalculatorInput("hello")).toEqual({
      ok: true,
      value: {
        mode: "data",
        data: "hello",
        encoding: "utf8"
      }
    });
  });
});

describe("parseHashCalculatorInput - raw data mode", () => {
  it("rejects empty data input", () => {
    expect(
      parseHashCalculatorInput({
        mode: "data",
        data: "   ",
        encoding: "utf8",
        envelope: "",
        passphrasePreset: "testnet",
        customPassphrase: ""
      })
    ).toEqual({
      ok: false,
      code: "empty_input"
    });
  });

  it("accepts valid utf8 text", () => {
    const result = parseHashCalculatorInput({
      mode: "data",
      data: "hello world",
      encoding: "utf8",
      envelope: "",
      passphrasePreset: "testnet",
      customPassphrase: ""
    });
    expect(result.ok).toBe(true);
  });

  it("accepts valid hexadecimal input", () => {
    const result = parseHashCalculatorInput({
      mode: "data",
      data: "deadbeef",
      encoding: "hex",
      envelope: "",
      passphrasePreset: "testnet",
      customPassphrase: ""
    });
    expect(result.ok).toBe(true);
  });

  it("rejects odd-length hexadecimal input", () => {
    expect(
      parseHashCalculatorInput({
        mode: "data",
        data: invalidHexOdd,
        encoding: "hex",
        envelope: "",
        passphrasePreset: "testnet",
        customPassphrase: ""
      })
    ).toEqual({
      ok: false,
      code: "invalid_encoding"
    });
  });

  it("rejects non-hex characters in hex mode", () => {
    expect(
      parseHashCalculatorInput({
        mode: "data",
        data: invalidHexChars,
        encoding: "hex",
        envelope: "",
        passphrasePreset: "testnet",
        customPassphrase: ""
      })
    ).toEqual({
      ok: false,
      code: "invalid_encoding"
    });
  });

  it("accepts valid base64 input", () => {
    const result = parseHashCalculatorInput({
      mode: "data",
      data: "aGVsbG8=",
      encoding: "base64",
      envelope: "",
      passphrasePreset: "testnet",
      customPassphrase: ""
    });
    expect(result.ok).toBe(true);
  });

  it("rejects invalid base64 input", () => {
    expect(
      parseHashCalculatorInput({
        mode: "data",
        data: invalidBase64,
        encoding: "base64",
        envelope: "",
        passphrasePreset: "testnet",
        customPassphrase: ""
      })
    ).toEqual({
      ok: false,
      code: "invalid_encoding"
    });
  });
});

describe("parseHashCalculatorInput - transaction envelope mode", () => {
  it("rejects empty envelope input", () => {
    expect(
      parseHashCalculatorInput({
        mode: "transaction",
        data: "",
        encoding: "utf8",
        envelope: "   ",
        passphrasePreset: "testnet",
        customPassphrase: ""
      })
    ).toEqual({
      ok: false,
      code: "empty_input"
    });
  });

  it("rejects secret keys entered as envelope with invalid_xdr", () => {
    expect(
      parseHashCalculatorInput({
        mode: "transaction",
        data: "",
        encoding: "utf8",
        envelope: secretKey,
        passphrasePreset: "testnet",
        customPassphrase: ""
      })
    ).toEqual({
      ok: false,
      code: "invalid_xdr"
    });
  });

  it("resolves testnet preset", () => {
    const result = parseHashCalculatorInput({
      mode: "transaction",
      data: "",
      encoding: "utf8",
      envelope: validEnvelopeXdr,
      passphrasePreset: "testnet",
      customPassphrase: ""
    });

    expect(result).toEqual({
      ok: true,
      value: {
        mode: "transaction",
        envelope: validEnvelopeXdr,
        passphrasePreset: "testnet",
        customPassphrase: "",
        resolvedPassphrase: Networks.TESTNET
      }
    });
  });

  it("resolves public preset", () => {
    const result = parseHashCalculatorInput({
      mode: "transaction",
      data: "",
      encoding: "utf8",
      envelope: validEnvelopeXdr,
      passphrasePreset: "public",
      customPassphrase: ""
    });

    expect(result).toEqual({
      ok: true,
      value: {
        mode: "transaction",
        envelope: validEnvelopeXdr,
        passphrasePreset: "public",
        customPassphrase: "",
        resolvedPassphrase: Networks.PUBLIC
      }
    });
  });

  it("resolves custom passphrase", () => {
    const result = parseHashCalculatorInput({
      mode: "transaction",
      data: "",
      encoding: "utf8",
      envelope: validEnvelopeXdr,
      passphrasePreset: "custom",
      customPassphrase: "My Network ; 2026"
    });

    expect(result).toEqual({
      ok: true,
      value: {
        mode: "transaction",
        envelope: validEnvelopeXdr,
        passphrasePreset: "custom",
        customPassphrase: "My Network ; 2026",
        resolvedPassphrase: "My Network ; 2026"
      }
    });
  });

  it("rejects empty custom passphrase with empty_passphrase", () => {
    expect(
      parseHashCalculatorInput({
        mode: "transaction",
        data: "",
        encoding: "utf8",
        envelope: validEnvelopeXdr,
        passphrasePreset: "custom",
        customPassphrase: "   "
      })
    ).toEqual({
      ok: false,
      code: "empty_passphrase"
    });
  });
});

describe("resolvePassphrase helper", () => {
  it("resolves standard networks correctly", () => {
    expect(resolvePassphrase("testnet", "")).toEqual({
      ok: true,
      value: Networks.TESTNET
    });
    expect(resolvePassphrase("public", "")).toEqual({
      ok: true,
      value: Networks.PUBLIC
    });
  });

  it("rejects empty custom passphrase", () => {
    expect(resolvePassphrase("custom", "")).toEqual({
      ok: false,
      code: "empty_passphrase"
    });
  });
});

describe("validator predicates", () => {
  it("validates hex characters and lengths", () => {
    expect(isValidHex("deadbeef")).toBe(true);
    expect(isValidHex("DEADBEEF")).toBe(true);
    expect(isValidHex("0102030405060708")).toBe(true);
    expect(isValidHex(invalidHexOdd)).toBe(false);
    expect(isValidHex(invalidHexChars)).toBe(false);
    expect(isValidHex("")).toBe(false);
  });

  it("validates base64 characters and encodings", () => {
    expect(isValidBase64("aGVsbG8=")).toBe(true);
    expect(isValidBase64("AAA=")).toBe(true);
    expect(isValidBase64(invalidBase64)).toBe(false);
    expect(isValidBase64("")).toBe(false);
  });
});
