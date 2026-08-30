/**
 * Byte primitives for the memo codec.
 *
 * Everything here works on `Uint8Array` and the platform's own `btoa`/`atob`
 * rather than Node's `Buffer`, so the same code runs unchanged in the browser,
 * where this tool does all of its work.
 */

const HEX = /^[0-9a-fA-F]+$/;
const BASE64 = /^[A-Za-z0-9+/]*={0,2}$/;

export function utf8Bytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

/** The length of a string in UTF-8 bytes — not in characters. */
export function byteLength(value: string): number {
  return utf8Bytes(value).length;
}

/** Decodes UTF-8 bytes, returning null when they are not valid UTF-8. */
export function utf8Text(bytes: Uint8Array): string | null {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

export function toHex(bytes: Uint8Array): string {
  let out = "";
  for (const byte of bytes) out += byte.toString(16).padStart(2, "0");
  return out;
}

/** Parses an even-length hex string. Returns null for anything else. */
export function fromHex(value: string): Uint8Array | null {
  const clean = value.replace(/\s+/g, "");
  if (!clean || clean.length % 2 !== 0 || !HEX.test(clean)) return null;

  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/**
 * Parses standard or URL-safe base64, tolerating missing padding.
 * Returns null when the input is not base64 at all.
 */
export function fromBase64(value: string): Uint8Array | null {
  let clean = value.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  if (!clean) return null;

  const remainder = clean.length % 4;
  if (remainder === 1) return null;
  if (remainder !== 0) clean = clean.padEnd(clean.length + (4 - remainder), "=");
  if (!BASE64.test(clean)) return null;

  try {
    const binary = atob(clean);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

export function concatBytes(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/** XDR encodes an unsigned 32-bit integer: 4 bytes, big-endian. */
export function uint32Bytes(value: number): Uint8Array {
  const out = new Uint8Array(4);
  new DataView(out.buffer).setUint32(0, value, false);
  return out;
}

export function readUint32(bytes: Uint8Array, offset: number): number {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(offset, false);
}

/** XDR encodes an unsigned 64-bit integer: 8 bytes, big-endian, via BigInt. */
export function uint64Bytes(value: bigint): Uint8Array {
  const out = new Uint8Array(8);
  let remaining = value;
  for (let i = 7; i >= 0; i -= 1) {
    out[i] = Number(remaining & 0xffn);
    remaining >>= 8n;
  }
  return out;
}

export function readUint64(bytes: Uint8Array, offset: number): bigint {
  let value = 0n;
  for (let i = 0; i < 8; i += 1) value = (value << 8n) | BigInt(bytes[offset + i]);
  return value;
}

/** XDR pads every variable-length field out to a multiple of four bytes. */
export function paddingLength(length: number): number {
  return (4 - (length % 4)) % 4;
}
