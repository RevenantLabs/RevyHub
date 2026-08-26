import { classifyHorizonError } from "@/core/horizon/errors";
import type { AssetFlagsInspectorErrorCode } from "@/features/asset-flags-inspector/types";

export function toAssetFlagsInspectorErrorCode(error: unknown): AssetFlagsInspectorErrorCode {
  const { code } = classifyHorizonError(error);

  if (code === "not_found") return "account_not_found";
  if (code === "rate_limited") return "rate_limited";
  return "request_failed";
}
