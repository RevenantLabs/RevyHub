import { MAX_NAME_BYTES, MAX_VALUE_BYTES } from "@/features/manage-data-codec/schema";
import type { ByteView, NameView } from "@/features/manage-data-codec/types";

export function formatBytes(count: number): string {
  return count === 1 ? "1 byte" : `${count} bytes`;
}

export function formatCharacters(count: number): string {
  return count === 1 ? "1 character" : `${count} characters`;
}

/** `12 of 64 bytes` — the remaining room, stated rather than implied. */
export function formatNameBudget(name: NameView): string {
  return `${name.byteLength} of ${MAX_NAME_BYTES} bytes`;
}

export function formatValueBudget(value: ByteView): string {
  return `${value.byteLength} of ${MAX_VALUE_BYTES} bytes`;
}

/**
 * True when a name costs more bytes than it has characters.
 *
 * Worth surfacing: a name that looks well short of the limit can be over it,
 * and the character count is the reason someone would be surprised.
 */
export function isMultibyte(name: NameView): boolean {
  return name.byteLength !== name.characterLength;
}

/** Groups hex into byte pairs so a reader can count them. */
export function formatHex(hex: string): string {
  if (!hex) return "(empty)";
  return (hex.match(/.{1,2}/g) ?? []).join(" ");
}

/** Base64 of zero bytes is the empty string, which needs saying out loud. */
export function formatBase64(base64: string): string {
  return base64 || "(empty)";
}

/**
 * Chooses what to show for the text reading of some bytes.
 *
 * `null` means the bytes are not valid UTF-8 and only the hex is honest.
 */
export function formatText(value: ByteView): string | null {
  if (!value.textLossless) return null;
  if (value.byteLength === 0) return "(empty)";
  return value.text;
}
