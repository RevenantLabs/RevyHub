import {
  getHorizonServer,
  isCancelledError,
  isTimeoutError,
  runHorizonRequest,
  STELLAR_NETWORK,
  type StellarNetwork
} from "@/lib/stellar/horizon";
import { validatePublicKey } from "@/lib/stellar/validateAddress";
import type { DisplayBalance } from "@/components/stellar/BalanceList";

export async function getAccountBalances(
  publicKey: string,
  network: StellarNetwork = STELLAR_NETWORK,
  signal?: AbortSignal
): Promise<DisplayBalance[]> {
  const validation = validatePublicKey(publicKey);

  if (!validation.valid) {
    throw new Error(validation.message);
  }

  try {
    const account = await runHorizonRequest(
      getHorizonServer(network).loadAccount(publicKey.trim()),
      { signal }
    );

    // TODO(issue #21): Return a typed account-not-found state so UI can link directly to the Testnet Faucet Helper.
    return account.balances.map((balance) => {
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
    });
  } catch (error) {
    if (isCancelledError(error)) {
      throw error;
    }

    if (isTimeoutError(error)) {
      throw new Error("The Horizon balance request timed out. Try again.");
    }

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
