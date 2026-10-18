import type { SorobanFootprintDiffErrorCode } from "@/features/soroban-footprint-diff/types";

/** Offline tool — unexpected throws map to invalid JSON rather than network codes. */
export function toSorobanFootprintDiffErrorCode(error: unknown): SorobanFootprintDiffErrorCode {
  void error;
  return "invalid_json";
}
