import { classifyHorizonError } from "@/core/horizon/errors";
import type { RegulatedAssetInspectorErrorCode } from "@/features/regulated-asset-inspector/types";

export function toRegulatedAssetInspectorErrorCode(error: unknown): RegulatedAssetInspectorErrorCode {
  const { code } = classifyHorizonError(error);
  if (code === "not_found") return "account_not_found";
  return "toml_unreachable";
}
