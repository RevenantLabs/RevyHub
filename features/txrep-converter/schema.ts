import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { MAX_INPUT_LENGTH } from "@/features/txrep-converter/lib/format-detect";
import type { TxrepConverterErrorCode, TxrepConverterInput } from "@/features/txrep-converter/types";

export function parseTxrepConverterInput(raw: string): Result<TxrepConverterInput, TxrepConverterErrorCode> {
  if (raw.trim().length === 0) return err("empty_input");
  if (raw.length > MAX_INPUT_LENGTH) return err("too_large");
  if (StrKey.isValidEd25519SecretSeed(raw.replace(/\s+/g, ""))) return err("invalid_xdr");
  return ok({ value: raw.trim() });
}
