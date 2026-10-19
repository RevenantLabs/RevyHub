import type { LedgerHeaderDecoderErrorCode } from "@/features/ledger-header-decoder/types";

/** This feature has no transport boundary; unexpected SDK decode failures have one code. */
export function toLedgerHeaderDecoderErrorCode(_error: unknown): LedgerHeaderDecoderErrorCode {
  void _error;
  return "malformed_header";
}
