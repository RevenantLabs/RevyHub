import type { ScvalCodecErrorCode } from "@/features/scval-codec/types";

/**
 * Maps unexpected transport failures onto this tool's own error codes.
 *
 * The ScVal codec is fully offline, so this mapper only exists to satisfy
 * the shared Result contract. Any unexpected error is treated as an unreadable
 * value.
 */
export function toScvalCodecErrorCode(_error: unknown): ScvalCodecErrorCode {
  void _error;
  return "request_failed";
}
