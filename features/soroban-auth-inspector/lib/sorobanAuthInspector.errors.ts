import type { SorobanAuthInspectorErrorCode } from "@/features/soroban-auth-inspector/types";

/**
 * Maps unexpected transport failures onto this tool's own error codes.
 *
 * The auth inspector is fully offline, so this mapper only exists to satisfy
 * the shared Result contract. Any unexpected error is treated as an unreadable
 * authorization entry.
 */
export function toSorobanAuthInspectorErrorCode(
  _error: unknown
): SorobanAuthInspectorErrorCode {
  void _error;
  return "auth_unreadable";
}
