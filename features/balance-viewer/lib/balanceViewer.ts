import type { Horizon } from "@stellar/stellar-sdk";
import { ok, err, type Result } from "@/core/result/result";
import { horizonServer } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { toBalanceViewerErrorCode } from "@/features/balance-viewer/lib/balanceViewer.errors";
import type {
  AccountBalances,
  BalanceViewerErrorCode,
  BalanceViewerInput,
  DisplayBalance
} from "@/features/balance-viewer/types";

type HorizonBalance = Horizon.HorizonApi.BalanceLine;

/** Normalises Horizon's three balance shapes into one display type. */
export function normalizeBalance(balance: HorizonBalance): DisplayBalance {
  if (balance.asset_type === "native") {
    return {
      kind: "native",
      assetCode: "XLM",
      balance: balance.balance,
      sellingLiabilities: balance.selling_liabilities,
      buyingLiabilities: balance.buying_liabilities
    };
  }

  if (balance.asset_type === "liquidity_pool_shares") {
    return {
      kind: "liquidity_pool",
      assetCode: "Pool shares",
      issuer: balance.liquidity_pool_id,
      balance: balance.balance,
      limit: balance.limit
    };
  }

  return {
    kind: "credit",
    assetCode: balance.asset_code,
    issuer: balance.asset_issuer,
    balance: balance.balance,
    limit: balance.limit,
    authorized: balance.is_authorized,
    sellingLiabilities: balance.selling_liabilities,
    buyingLiabilities: balance.buying_liabilities
  };
}

/** Native first, then credit assets by code, then pool shares. */
export function sortBalances(balances: DisplayBalance[]): DisplayBalance[] {
  const rank: Record<DisplayBalance["kind"], number> = {
    native: 0,
    credit: 1,
    liquidity_pool: 2
  };

  return [...balances].sort(
    (a, b) => rank[a.kind] - rank[b.kind] || a.assetCode.localeCompare(b.assetCode)
  );
}

export async function loadAccountBalances(
  { accountId }: BalanceViewerInput,
  network: StellarNetwork
): Promise<Result<AccountBalances, BalanceViewerErrorCode>> {
  try {
    const account = await horizonServer(network).loadAccount(accountId);

    return ok({
      accountId: account.accountId(),
      subentryCount: account.subentry_count,
      balances: sortBalances(account.balances.map(normalizeBalance))
    });
  } catch (error) {
    return err(toBalanceViewerErrorCode(error));
  }
}
