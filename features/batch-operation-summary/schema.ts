import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type { BatchOperationSummaryErrorCode, BatchOperationSummaryInput } from "@/features/batch-operation-summary/types";

export const MAX_ENVELOPE_CHARACTERS = 200_000;

export function parseBatchOperationSummaryInput(raw: string): Result<BatchOperationSummaryInput, BatchOperationSummaryErrorCode> {
  const envelope = normalizeInput(raw);
  if (!envelope) return err("empty_xdr");
  if (envelope.length > MAX_ENVELOPE_CHARACTERS) return err("too_large");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(envelope)) return err("invalid_xdr");
  return ok({ envelope });
}
