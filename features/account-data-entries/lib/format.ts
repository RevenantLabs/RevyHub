import type { AccountDataValue } from "@/features/account-data-entries/types";

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;
const TEXT_DECODER = new TextDecoder("utf-8", { fatal: true });
const NON_PRINTABLE = /\p{C}/u;

function base64ToBytes(rawBase64: string): Uint8Array | null {
  const compact = rawBase64.replace(/\s+/g, "");
  if (!compact || compact.length % 4 !== 0 || !BASE64.test(compact)) return null;

  try {
    const binary = atob(compact);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function formatByteLength(byteLength: number): string {
  return `${byteLength} byte${byteLength === 1 ? "" : "s"}`;
}

export function decodeAccountDataValue(rawBase64: string): AccountDataValue {
  const bytes = base64ToBytes(rawBase64);
  if (!bytes) return { kind: "invalid_base64" };

  try {
    const text = TEXT_DECODER.decode(bytes);
    if (text.length > 0 && !NON_PRINTABLE.test(text)) {
      return { kind: "text", text, byteLength: bytes.length };
    }
  } catch {
    // Non-UTF-8 bytes fall through to the hex representation below.
  }

  return { kind: "bytes", hex: bytesToHex(bytes), byteLength: bytes.length };
}

export function formatDecodedAccountDataValue(value: AccountDataValue): string {
  if (value.kind === "text") return value.text;
  if (value.kind === "bytes") return `0x${value.hex}`;
  return "Invalid base64";
}
