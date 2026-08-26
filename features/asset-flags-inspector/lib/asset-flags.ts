import { horizonServer } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { err, ok, type Result } from "@/core/result/result";
import { toAssetFlagsInspectorErrorCode } from "@/features/asset-flags-inspector/lib/asset-flags.errors";
import type {
  AssetFlagsInspectorErrorCode,
  AssetFlagsInspectorInput,
  AssetFlagsInspectorResult,
} from "@/features/asset-flags-inspector/types";

export async function runAssetFlagsInspector(
  input: AssetFlagsInspectorInput,
  network: StellarNetwork
): Promise<Result<AssetFlagsInspectorResult, AssetFlagsInspectorErrorCode>> {
  try {
    const account = await horizonServer(network).loadAccount(input.accountId);

    return ok({
      accountId: account.accountId(),
      flags: {
        authRequired: account.flags.auth_required,
        authRevocable: account.flags.auth_revocable,
        authImmutable: account.flags.auth_immutable,
        authClawbackEnabled: account.flags.auth_clawback_enabled,
      },
    });
  } catch (error) {
    return err(toAssetFlagsInspectorErrorCode(error));
  }
}
