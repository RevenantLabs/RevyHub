import type { MuxedAccountCodecErrorCode } from "@/features/muxed-account-codec/types";

/**
 * Maps unexpected exceptions into stable codec error codes.
 */
export function toMuxedAccountCodecErrorCode(error: unknown): MuxedAccountCodecErrorCode {
  if (
    error instanceof RangeError ||
    (error instanceof Error && error.message.toLowerCase().includes("id"))
  ) {
    return "invalid_id";
  }
  return "invalid_muxed_address";
}

/**
 * Returns true if the error code indicates input that must never be echoed.
 */
export function shouldRedact(code: MuxedAccountCodecErrorCode): boolean {
  return code === "invalid_muxed_address" || code === "invalid_base_address";
}
