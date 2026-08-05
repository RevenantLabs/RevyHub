import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateMiddle(value: string, visible = 6) {
  if (value.length <= visible * 2 + 3) {
    return value;
  }

  return `${value.slice(0, visible)}...${value.slice(-visible)}`;
}

/**
 * Replace the middle of a long identifier with a fixed block of redacted
 * characters so the original value cannot be reconstructed from a screenshot
 * while preserving enough type context (prefix, suffix) for recognisability.
 *
 * - Stellar public keys / issuers (56-char G…): `G••••••••Q7H6`
 * - Transaction hashes (64 hex chars):            `ab••••••••6789`
 * - Balance IDs / other long strings:             `01••••••••abcd`
 * - Short strings (< 12 chars):                  returned unchanged
 */
export function redactValue(value: string): string {
  if (value.length < 12) return value;

  // Stellar G-prefixed keys (56 chars) only show the leading "G" for
  // type context; everything else shows the first two characters.
  const head = value.length >= 56 && value.startsWith("G") ? 1 : 2;
  const tail = 4;
  const masked = "••••••••";

  // Don't expand strings that are already short enough to fit in the mask.
  if (value.length <= head + tail + masked.length) {
    return value;
  }

  return `${value.slice(0, head)}${masked}${value.slice(-tail)}`;
}
