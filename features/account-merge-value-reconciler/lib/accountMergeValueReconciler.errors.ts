import type { AccountMergeValueReconcilerErrorCode } from "../types";

/** Union arms the installed SDK can decode for each pasted XDR type. */
export const SUPPORTED_ENVELOPE_TYPES = new Set([0, 2, 5]);
export const SUPPORTED_METADATA_VERSIONS = new Set([0, 1, 2, 3]);

/**
 * Reads the leading 32-bit union discriminant of base64 XDR without decoding
 * the rest, so a newer protocol arm (for example TransactionMeta v4) is
 * reported as unsupported rather than as corrupt data.
 */
export function peekDiscriminant(base64: string): number | null {
  if (base64.length < 8) return null;
  const head = atob(base64.slice(0, 8));
  if (head.length < 4) return null;
  return ((head.charCodeAt(0) << 24) | (head.charCodeAt(1) << 16) | (head.charCodeAt(2) << 8) | head.charCodeAt(3)) | 0;
}

/**
 * Decoder failures (truncated buffers, bad padding, unknown enum values,
 * trailing bytes) all mean the pasted bytes are not the expected XDR type.
 * The decoder message is never surfaced because it can echo pasted input.
 */
export function toAccountMergeValueReconcilerErrorCode(error: unknown): AccountMergeValueReconcilerErrorCode {
  void error;
  return "malformed_data";
}
