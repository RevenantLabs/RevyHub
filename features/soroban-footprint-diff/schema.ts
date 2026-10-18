import { err, ok, type Result } from "@/core/result/result";
import {
  MAX_INPUT_CHARS,
  type SorobanFootprintDiffErrorCode,
  type SorobanFootprintDiffInput
} from "@/features/soroban-footprint-diff/types";

export interface RawSorobanFootprintDiffForm {
  firstResult: string;
  secondResult: string;
}

export function parseSorobanFootprintDiffInput(
  raw: RawSorobanFootprintDiffForm
): Result<SorobanFootprintDiffInput, SorobanFootprintDiffErrorCode> {
  const firstResult = raw.firstResult.trim();
  const secondResult = raw.secondResult.trim();

  if (!firstResult) return err("empty_first_result");
  if (!secondResult) return err("empty_second_result");
  if (firstResult.length > MAX_INPUT_CHARS || secondResult.length > MAX_INPUT_CHARS) {
    return err("too_large");
  }

  return ok({ firstResult, secondResult });
}
