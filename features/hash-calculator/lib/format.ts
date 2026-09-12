import type { DataEncoding, NetworkPassphrasePreset } from "@/features/hash-calculator/types";

/** Formats byte count as a readable string. */
export function formatBytes(byteCount: number): string {
  if (byteCount === 1) return "1 byte";
  return `${byteCount} bytes`;
}

/** Formats an encoding identifier for human display. */
export function formatEncoding(encoding: DataEncoding): string {
  switch (encoding) {
    case "utf8":
      return "UTF-8";
    case "hex":
      return "Hexadecimal";
    case "base64":
      return "Base64";
  }
}

/** Formats a passphrase preset identifier for human display. */
export function formatPassphrasePreset(preset: NetworkPassphrasePreset): string {
  switch (preset) {
    case "testnet":
      return "Testnet";
    case "public":
      return "Mainnet / Public";
    case "custom":
      return "Custom Network";
  }
}
