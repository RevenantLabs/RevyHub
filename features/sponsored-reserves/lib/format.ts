import type { Horizon } from "@stellar/stellar-sdk";

export function formatBalanceDetails(balance: Horizon.HorizonApi.BalanceLine): string {
  if (balance.asset_type === "native") return "XLM";
  if (balance.asset_type === "liquidity_pool_shares") return "Liquidity Pool";
  return `${balance.asset_code}:${balance.asset_issuer}`;
}
