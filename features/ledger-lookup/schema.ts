import { err, ok, type Result } from "@/core/result/result";
import type { LedgerLookupInput, LedgerLookupErrorCode } from "./types";
export function parseLedgerLookupInput(raw: string): Result<LedgerLookupInput, LedgerLookupErrorCode> {
 const value = raw.trim(); if (!value) return err("empty_input");
 if (value.length > 10 || !/^[0-9]+$/.test(value)) return err("invalid_sequence");
 const n = BigInt(value); if (n < 1n || n > 4294967295n) return err("invalid_sequence");
 return ok({sequence: Number(n)});
}
