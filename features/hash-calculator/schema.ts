import { Networks } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  DataEncoding,
  HashCalculatorErrorCode,
  HashCalculatorInput,
  HashCalculatorMode,
  NetworkPassphrasePreset
} from "@/features/hash-calculator/types";

const HEX_PATTERN = /^[0-9a-fA-F]+$/;
const BASE64_PATTERN = /^[A-Za-z0-9+/]*={0,2}$/;

/** Raw form state emitted by the UI component. */
export interface RawHashCalculatorForm {
  mode: HashCalculatorMode;
  data: string;
  encoding: DataEncoding;
  envelope: string;
  passphrasePreset: NetworkPassphrasePreset;
  customPassphrase: string;
}

/** Validates whether a string is well-formed hexadecimal bytes. */
export function isValidHex(raw: string): boolean {
  const clean = raw.replace(/\s+/g, "");
  return clean.length > 0 && clean.length % 2 === 0 && HEX_PATTERN.test(clean);
}

/** Validates whether a string is decodable base64. */
export function isValidBase64(raw: string): boolean {
  let clean = raw.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  if (!clean) return false;
  const remainder = clean.length % 4;
  if (remainder === 1) return false;
  if (remainder !== 0) {
    clean = clean.padEnd(clean.length + (4 - remainder), "=");
  }
  if (!BASE64_PATTERN.test(clean)) return false;
  try {
    if (typeof atob === "function") {
      atob(clean);
      return true;
    }
    if (typeof Buffer !== "undefined") {
      Buffer.from(clean, "base64");
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** Resolves the effective network passphrase string from preset and custom inputs. */
export function resolvePassphrase(
  preset: NetworkPassphrasePreset,
  customPassphrase: string
): Result<string, HashCalculatorErrorCode> {
  if (preset === "testnet") {
    return ok(Networks.TESTNET);
  }
  if (preset === "public") {
    return ok(Networks.PUBLIC);
  }
  const custom = customPassphrase.trim();
  if (!custom) {
    return err("empty_passphrase");
  }
  return ok(custom);
}

/** Parses raw form input into a validated request object, returning a Result without throwing. */
export function parseHashCalculatorInput(
  raw: RawHashCalculatorForm | string
): Result<HashCalculatorInput, HashCalculatorErrorCode> {
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) {
      return err("empty_input");
    }
    return ok({
      mode: "data",
      data: trimmed,
      encoding: "utf8"
    });
  }

  if (raw.mode === "data") {
    const trimmedData = raw.data.trim();
    if (!trimmedData) {
      return err("empty_input");
    }

    if (raw.encoding === "hex" && !isValidHex(trimmedData)) {
      return err("invalid_encoding");
    }

    if (raw.encoding === "base64" && !isValidBase64(trimmedData)) {
      return err("invalid_encoding");
    }

    return ok({
      mode: "data",
      data: raw.data,
      encoding: raw.encoding
    });
  }

  const envelope = raw.envelope.replace(/\s+/g, "");
  if (!envelope) {
    return err("empty_input");
  }

  if (envelope.startsWith("S")) {
    return err("invalid_xdr");
  }

  const passphraseResult = resolvePassphrase(raw.passphrasePreset, raw.customPassphrase);
  if (!passphraseResult.ok) {
    return passphraseResult;
  }

  return ok({
    mode: "transaction",
    envelope,
    passphrasePreset: raw.passphrasePreset,
    customPassphrase: raw.customPassphrase,
    resolvedPassphrase: passphraseResult.value
  });
}
