import { ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { parseMultiAccountAssetExposureInput } from "../schema";
import type { MultiAccountAssetExposureErrorCode as Code, MultiAccountAssetExposureInput as Input, MultiAccountAssetExposureResult as Exposure } from "../types";
import { fetchAccountBatch } from "./account-batch";
import { buildAssetMatrix } from "./asset-matrix";
export async function runMultiAccountAssetExposure(input: Input, network: StellarNetwork, signal?: AbortSignal): Promise<Result<Exposure, Code>> {
  // Guard this public entry point as well as the form: callers cannot bypass seed validation.
  const parsed = parseMultiAccountAssetExposureInput(input.accountIds.join("\n"));
  if (!parsed.ok) return parsed;
  const accounts = await fetchAccountBatch(parsed.value.accountIds, network, signal);
  return ok({ accounts, matrix: buildAssetMatrix(accounts) });
}
