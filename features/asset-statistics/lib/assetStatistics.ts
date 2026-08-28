import { err, ok, type Result } from "@/core/result/result";
import { horizonServer } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { toAssetStatisticsErrorCode } from "@/features/asset-statistics/lib/assetStatistics.errors";
import type { AssetStatisticsErrorCode, AssetStatisticsInput, AssetStatisticsResult } from "@/features/asset-statistics/types";

export async function checkAssetStatistics(
  input: AssetStatisticsInput,
  network: StellarNetwork
): Promise<Result<AssetStatisticsResult, AssetStatisticsErrorCode>> {
  try {
    const response = await horizonServer(network)
      .assets()
      .forCode(input.assetCode)
      .forIssuer(input.issuerId)
      .call();

    const record = response.records[0];
    if (!record) {
      return err("asset_not_found");
    }

    return ok({
      assetCode: record.asset_code,
      issuerId: record.asset_issuer,
      supply: record.amount,
      claimableBalancesAmount: record.claimable_balances_amount,
      numClaimableBalances: record.num_claimable_balances,
      flags: {
        authRequired: record.flags.auth_required,
        authRevocable: record.flags.auth_revocable,
        authImmutable: record.flags.auth_immutable,
        clawbackEnabled: record.flags.clawback_enabled
      },
      accounts: {
        authorized: record.accounts.authorized,
        authorizedToMaintainLiabilities: record.accounts.authorized_to_maintain_liabilities,
        unauthorized: record.accounts.unauthorized
      },
      balances: {
        authorized: record.balances.authorized,
        authorizedToMaintainLiabilities: record.balances.authorized_to_maintain_liabilities,
        unauthorized: record.balances.unauthorized
      }
    });
  } catch (error) {
    return err(toAssetStatisticsErrorCode(error));
  }
}
