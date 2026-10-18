import { xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { ErrorCode, LedgerResult, LedgerRow } from "../types";

export const MAX_WASM_BYTES = 131_072;

export function contractCodeKey(digest: Buffer): string {
  return xdr.LedgerKey.contractCode(new xdr.LedgerKeyContractCode({ hash: digest })).toXDR("base64");
}

export function decodeCodeEntry(encoded: string, maxBytes = MAX_WASM_BYTES): Result<{ wasm: Buffer }, ErrorCode> {
  try {
    const wasm = Buffer.from(xdr.LedgerEntry.fromXDR(encoded, "base64").data().contractCode().code());
    if (wasm.length > maxBytes) return err("entry_oversized");
    return ok({ wasm });
  } catch {
    return err("malformed_entry");
  }
}

/** Decide whether a getLedgerEntries payload is usable before decoding. */
export function inspectLedgerResult(result: LedgerResult): Result<LedgerRow, ErrorCode> {
  const row = result.entries[0];
  if (!row) return err("entry_missing");
  if (row.liveUntilLedgerSeq !== undefined && row.liveUntilLedgerSeq < result.latestLedger) return err("entry_archived");
  return ok(row);
}
