import { ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import type { AssetFlagsInspectorErrorCode, AssetFlagsInspectorInput, AssetFlagsInspectorResult } from "@/features/asset-flags-inspector/types";

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function runAssetFlagsInspector(
  input: AssetFlagsInspectorInput,
  _network: StellarNetwork,
  _signal?: AbortSignal
): Promise<Result<AssetFlagsInspectorResult, AssetFlagsInspectorErrorCode>> {
  return ok({ summary: input.value });
}
