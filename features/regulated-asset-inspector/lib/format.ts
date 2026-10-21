import type { RegulatedAssetInspectorResult } from "@/features/regulated-asset-inspector/types";

export const SELF_PUBLISHED_NOTICE =
  "Self-published by the issuer and not independently verified.";

export function formatRegulatedStatus(result: RegulatedAssetInspectorResult): string {
  return result.regulatedStatus === "regulated" ? "Regulated" : "Not regulated";
}

export function formatOptional(value: string | null): string {
  return value ?? "Not declared";
}

export function formatFlag(value: boolean): string {
  return value ? "true" : "false";
}
