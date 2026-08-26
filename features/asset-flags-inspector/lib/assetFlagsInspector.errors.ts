import { classifyHorizonError } from "@/core/horizon/errors";
import type { AssetFlagsInspectorErrorCode } from "@/features/asset-flags-inspector/types";

/** Maps transport failures onto this tool's own error codes. */
export function toAssetFlagsInspectorErrorCode(error: unknown): AssetFlagsInspectorErrorCode {
  const { code } = classifyHorizonError(error);
  return code === "not_found" ? "not_found" : "request_failed";
}
