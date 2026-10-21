import { type Result } from "@/core/result/result";
import { parseLedgerHeaderDecoderInput } from "@/features/ledger-header-decoder/schema";
import { decodeLedgerHeader } from "@/features/ledger-header-decoder/lib/ledger-header-decode";
import type { LedgerHeaderDecoderErrorCode, LedgerHeaderDecoderResult } from "@/features/ledger-header-decoder/types";

/** One entry point validates the paste before letting the SDK parse any bytes. */
export function runLedgerHeaderDecoder(raw: string): Result<LedgerHeaderDecoderResult, LedgerHeaderDecoderErrorCode> {
  const parsed = parseLedgerHeaderDecoderInput(raw);
  return parsed.ok ? decodeLedgerHeader(parsed.value.xdr) : parsed;
}
