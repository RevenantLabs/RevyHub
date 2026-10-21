import { err, ok, type Result } from "@/core/result/result";
import type { LedgerHeaderDecoderErrorCode, LedgerHeaderDecoderInput } from "@/features/ledger-header-decoder/types";

export const MAX_XDR_LENGTH = 65_536;
const BASE64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

/** Bound raw input first so even whitespace-only pastes cannot consume unbounded work. */
export function parseLedgerHeaderDecoderInput(raw: string): Result<LedgerHeaderDecoderInput, LedgerHeaderDecoderErrorCode> {
  if (raw.length > MAX_XDR_LENGTH) return err("too_large");
  const xdr = raw.replace(/\s+/g, "");
  if (!xdr) return err("empty_xdr");
  // Ledger headers start with a uint32 protocol version; a secret seed starts with S.
  if (xdr.startsWith("S")) return err("invalid_xdr");
  if (!BASE64.test(xdr)) return err("invalid_xdr");
  return ok({ xdr });
}
