import { xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { decodeScpValue } from "@/features/ledger-header-decoder/lib/scp-value-fields";
import type { LedgerHeaderDecoderErrorCode, LedgerHeaderDecoderResult } from "@/features/ledger-header-decoder/types";

export function decodeLedgerHeader(encoded: string): Result<LedgerHeaderDecoderResult, LedgerHeaderDecoderErrorCode> {
  try {
    const bytes = Buffer.from(encoded, "base64");
    const header = xdr.LedgerHeader.fromXDR(bytes);
    if (!header.toXDR().equals(bytes)) return err("malformed_header");
    const scpValue = decodeScpValue(header.scpValue());
    if (!scpValue.ok) return scpValue;
    return ok({
      protocolVersion: String(header.ledgerVersion()),
      ledgerSequence: String(header.ledgerSeq()),
      baseFee: String(header.baseFee()),
      baseReserve: String(header.baseReserve()),
      scpValue: scpValue.value
    });
  } catch {
    return err("malformed_header");
  }
}
