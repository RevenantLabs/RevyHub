import { Networks, TransactionBuilder } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  DataEncoding,
  HashCalculatorErrorCode,
  HashCalculatorInput,
  HashCalculatorResult
} from "@/features/hash-calculator/types";

const HEX_PATTERN = /^[0-9a-fA-F]+$/;
const BASE64_PATTERN = /^[A-Za-z0-9+/]*={0,2}$/;

/** Converts a byte array into a lowercase hexadecimal string. */
export function toHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

/** Converts a byte array into a standard base64 string. */
export function toBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/** Parses a hexadecimal string into a Uint8Array, or returns null on error. */
export function fromHex(raw: string): Uint8Array | null {
  const clean = raw.replace(/\s+/g, "");
  if (!clean || clean.length % 2 !== 0 || !HEX_PATTERN.test(clean)) {
    return null;
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/** Parses a base64 string into a Uint8Array, or returns null on error. */
export function fromBase64(raw: string): Uint8Array | null {
  let clean = raw.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  if (!clean) return null;
  const remainder = clean.length % 4;
  if (remainder === 1) return null;
  if (remainder !== 0) {
    clean = clean.padEnd(clean.length + (4 - remainder), "=");
  }
  if (!BASE64_PATTERN.test(clean)) return null;
  try {
    if (typeof atob === "function") {
      const binary = atob(clean);
      const out = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        out[i] = binary.charCodeAt(i);
      }
      return out;
    }
    if (typeof Buffer !== "undefined") {
      const buf = Buffer.from(clean, "base64");
      return new Uint8Array(buf);
    }
    return null;
  } catch {
    return null;
  }
}

/** Decodes input string to byte array according to the specified encoding. */
export function decodeInputBytes(
  data: string,
  encoding: DataEncoding
): Result<Uint8Array, HashCalculatorErrorCode> {
  switch (encoding) {
    case "utf8":
      return ok(new TextEncoder().encode(data));
    case "hex": {
      const parsed = fromHex(data);
      if (!parsed) return err("invalid_encoding");
      return ok(parsed);
    }
    case "base64": {
      const parsed = fromBase64(data);
      if (!parsed) return err("invalid_encoding");
      return ok(parsed);
    }
  }
}

/** Core hash calculation logic. Returns a Result without throwing. */
export async function runHashCalculator(
  input: HashCalculatorInput
): Promise<Result<HashCalculatorResult, HashCalculatorErrorCode>> {
  if (input.mode === "data") {
    const bytesResult = decodeInputBytes(input.data, input.encoding);
    if (!bytesResult.ok) {
      return bytesResult;
    }
    const bytes = bytesResult.value;

    if (typeof globalThis.crypto === "undefined" || !globalThis.crypto?.subtle?.digest) {
      return err("crypto_unavailable");
    }

    try {
      const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes as BufferSource);
      const hashBytes = new Uint8Array(digest);
      const hashHex = toHex(hashBytes);
      const hashBase64 = toBase64(hashBytes);

      return ok({
        mode: "data",
        encoding: input.encoding,
        inputByteLength: bytes.length,
        hashHex,
        hashBase64
      });
    } catch {
      return err("crypto_unavailable");
    }
  }

  try {
    const tx = TransactionBuilder.fromXDR(input.envelope, input.resolvedPassphrase);
    const hashBuf = tx.hash();
    const hashHex = hashBuf.toString("hex");
    const hashBase64 = hashBuf.toString("base64");

    const testnetTx = TransactionBuilder.fromXDR(input.envelope, Networks.TESTNET);
    const testnetHashBuf = testnetTx.hash();
    const testnetHashHex = testnetHashBuf.toString("hex");
    const testnetHashBase64 = testnetHashBuf.toString("base64");

    const publicTx = TransactionBuilder.fromXDR(input.envelope, Networks.PUBLIC);
    const publicHashBuf = publicTx.hash();
    const publicHashHex = publicHashBuf.toString("hex");
    const publicHashBase64 = publicHashBuf.toString("base64");

    const opCount = "operations" in tx && Array.isArray(tx.operations) ? tx.operations.length : 1;
    const envelopeType = "innerTransaction" in tx ? "FeeBumpTransaction" : "Transaction";

    return ok({
      mode: "transaction",
      selectedPreset: input.passphrasePreset,
      selectedPassphrase: input.resolvedPassphrase,
      hashHex,
      hashBase64,
      testnetHashHex,
      testnetHashBase64,
      publicHashHex,
      publicHashBase64,
      envelopeType,
      operationCount: opCount,
      hasDifferentStandardHashes: testnetHashHex !== publicHashHex
    });
  } catch {
    return err("invalid_xdr");
  }
}
