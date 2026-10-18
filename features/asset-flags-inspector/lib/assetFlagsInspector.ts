import { err, ok, type Result } from "@/core/result/result";
import { horizonServer } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { toAssetFlagsInspectorErrorCode } from "@/features/asset-flags-inspector/lib/assetFlagsInspector.errors";
import { buildCallouts, buildSummary } from "@/features/asset-flags-inspector/lib/format";
import type {
  AssetFlagsInspectorErrorCode,
  AssetFlagsInspectorInput,
  AssetFlagsInspectorResult,
  IssuerAuthorizationFlags
} from "@/features/asset-flags-inspector/types";

export interface HorizonAccountFlags {
  auth_required?: boolean;
  auth_revocable?: boolean;
  auth_clawback_enabled?: boolean;
  auth_immutable?: boolean;
}

/** Pure mapper, exported so flag parsing can be tested directly. */
export function parseHorizonFlags(flags: HorizonAccountFlags): IssuerAuthorizationFlags {
  return {
    authRequired: flags.auth_required === true,
    authRevocable: flags.auth_revocable === true,
    authClawbackEnabled: flags.auth_clawback_enabled === true,
    authImmutable: flags.auth_immutable === true
  };
}

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function runAssetFlagsInspector(
  input: AssetFlagsInspectorInput,
  network: StellarNetwork,
  _signal?: AbortSignal
): Promise<Result<AssetFlagsInspectorResult, AssetFlagsInspectorErrorCode>> {
  try {
    const account = await horizonServer(network).loadAccount(input.issuerId);
    const flags = parseHorizonFlags(account.flags as HorizonAccountFlags);

    return ok({
      issuerId: input.issuerId,
      flags,
      summary: buildSummary(flags),
      callouts: buildCallouts(flags)
    });
  } catch (error) {
    return err(toAssetFlagsInspectorErrorCode(error));
  }
}
