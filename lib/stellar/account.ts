import { getHorizonServer, STELLAR_NETWORK, type StellarNetwork } from "@/lib/stellar/horizon";
import { validatePublicKey } from "@/lib/stellar/validateAddress";
import type { DisplayBalance } from "@/components/stellar/BalanceList";

export async function getAccountBalances(
  publicKey: string,
  network: StellarNetwork = STELLAR_NETWORK
): Promise<DisplayBalance[]> {
  const validation = validatePublicKey(publicKey);

  if (!validation.valid) {
    throw new Error(validation.message);
  }

  try {
    const account = await getHorizonServer(network).loadAccount(publicKey.trim());

    // TODO(issue #21): Return a typed account-not-found state so UI can link directly to the Testnet Faucet Helper.
    return account.balances.map((balance) => {
      if (balance.asset_type === "native") {
        return {
          assetCode: "XLM",
          assetType: "native",
          amount: balance.balance
        };
      }

      if (balance.asset_type === "liquidity_pool_shares") {
        return {
          assetCode: "Liquidity pool shares",
          assetType: "liquidity_pool_shares",
          poolId: balance.liquidity_pool_id,
          amount: balance.balance
        };
      }

      return {
        assetCode: balance.asset_code,
        issuer: balance.asset_issuer,
        assetType: "issued",
        amount: balance.balance
      };
    });
  } catch (error) {
    const responseStatus = getResponseStatus(error);

    if (responseStatus === 404) {
      throw new Error(
        network === "testnet"
          ? "Account not found on Stellar testnet. Fund it with Friendbot first."
          : "Account not found on Stellar mainnet."
      );
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
