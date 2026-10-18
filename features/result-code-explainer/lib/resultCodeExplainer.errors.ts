import type { ResultCodeExplainerErrorCode } from "@/features/result-code-explainer/types";

/** Offline tool — maps unexpected throws to a stable error code. */
export function toResultCodeExplainerErrorCode(_error: unknown): ResultCodeExplainerErrorCode {
  return "invalid_xdr";
}
