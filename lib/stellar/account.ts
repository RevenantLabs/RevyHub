import { getHorizonServer, STELLAR_NETWORK, type StellarNetwork } from "@/lib/stellar/horizon";
import { validatePublicKey } from "@/lib/stellar/validateAddress";
import type { DisplayBalance } from "@/components/stellar/BalanceList";

export type AccountLookup =
  | { found: true; balances: DisplayBalance[] }
  | { found: false; reason: "not-found"; network: StellarNetwork };

export async function getAccountBalances(
  publicKey: string,
  network: StellarNetwork = STELLAR_NETWORK
): Promise<AccountLookup> {
  const validation = validatePublicKey(publicKey);

  if (!validation.valid) {
    throw new Error(validation.message);
  }

  try {
    const account = await getHorizonServer(network).loadAccount(publicKey.trim());

    return {
      found: true,
      balances: account.balances.map((balance) => {
        if (balance.asset_type === "native") {
          return {
            assetCode: "XLM",
            amount: balance.balance
          };
        }

        if (balance.asset_type === "liquidity_pool_shares") {
          return {
            assetCode: "Liquidity pool shares",
            issuer: balance.liquidity_pool_id,
            amount: balance.balance
          };
        }

        return {
          assetCode: balance.asset_code,
          issuer: balance.asset_issuer,
          amount: balance.balance
        };
      })
    };
  } catch (error) {
    const responseStatus = getResponseStatus(error);

    if (responseStatus === 404) {
      return { found: false, reason: "not-found", network };
    }

    throw new Error("Could not load account balances from Horizon. Try again in a moment.");
  }
}

export function getResponseStatus(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { status?: number } }).response;
    return response?.status;
  }

  return undefined;
}
