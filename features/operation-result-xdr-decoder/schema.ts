import { err, ok, type Result } from "@/core/result/result";
import type { OperationResultXdrDecoderInput, OperationResultXdrDecoderErrorCode } from "./types";

/** Validate before any network request; never echo malformed input. */
export function parseOperationResultXdrDecoderInput(raw: string): Result<OperationResultXdrDecoderInput, OperationResultXdrDecoderErrorCode> {
  const hash = raw.trim();
  if (!/^[a-fA-F0-9]{64}$/.test(hash)) return err("invalid_hash");
  return ok({ hash: hash.toLowerCase() });
}
