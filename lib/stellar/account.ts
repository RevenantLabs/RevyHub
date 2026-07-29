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

function sortBalances(balances: DisplayBalance[]): DisplayBalance[] {
  return [...balances].sort((left, right) => {
    const sectionOrder = {
      native: 0,
      credit: 1,
      liquidity_pool: 2
    };

    const sectionDifference = sectionOrder[left.balanceType] - sectionOrder[right.balanceType];

    if (sectionDifference !== 0) {
      return sectionDifference;
    }

    const assetComparison = left.assetCode.localeCompare(right.assetCode, undefined, {
      sensitivity: "base"
    });

    if (assetComparison !== 0) {
      return assetComparison;
    }

    return (left.issuer ?? "").localeCompare(right.issuer ?? "");
  });
}

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
    const normalizedBalances = account.balances.map((balance) => {
      if (balance.asset_type === "native") {
        return {
          assetCode: "XLM",
          amount: balance.balance,
          balanceType: "native" as const
        };
      }

      if (balance.asset_type === "liquidity_pool_shares") {
        return {
          assetCode: "Liquidity pool shares",
          issuer: balance.liquidity_pool_id,
          amount: balance.balance,
          balanceType: "liquidity_pool" as const
        };
      }

      return {
        assetCode: balance.asset_code,
        issuer: balance.asset_issuer,
        amount: balance.balance,
        balanceType: "credit" as const
      };
    });

    return sortBalances(normalizedBalances);
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
