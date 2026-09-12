import type { StrKeyKind } from "@/features/strkey-inspector/types";
import { kindLabels } from "@/features/strkey-inspector/copy";

/**
 * Returns the formatted display label for a given StrKey kind.
 */
export function formatKind(kind: StrKeyKind): string {
  return kindLabels[kind] ?? kind;
}

/**
 * Formats a byte length count into a human-readable string.
 */
export function formatByteLength(bytes: number): string {
  return `${bytes} byte${bytes === 1 ? "" : "s"}`;
}

/**
 * Formats a raw hex string for clean presentation.
 */
export function formatHex(hex: string): string {
  return hex.toLowerCase();
}
