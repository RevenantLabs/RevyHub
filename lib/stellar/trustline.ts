import {
  getHorizonServer,
  isCancelledError,
  isTimeoutError,
  runHorizonRequest,
  STELLAR_NETWORK,
  type StellarNetwork
} from "@/lib/stellar/horizon";
import { validatePublicKey } from "@/lib/stellar/validateAddress";
import { getResponseStatus } from "@/lib/stellar/account";

export interface TrustlineCheck {
  exists: boolean;
  message: string;
}

export async function checkTrustline(
  accountAddress: string,
  assetCode: string,
  issuerAddress: string,
  network: StellarNetwork = STELLAR_NETWORK,
  signal?: AbortSignal
): Promise<TrustlineCheck> {
  // TODO(issue #5): Add network-aware USDC presets and validate issuer/code pairs before Horizon lookup.
  const accountValidation = validatePublicKey(accountAddress);
  const issuerValidation = validatePublicKey(issuerAddress);

  if (!accountValidation.valid) {
    throw new Error(`Account address: ${accountValidation.message}`);
  }

  if (!assetCode.trim()) {
    throw new Error("Enter an asset code such as USDC.");
  }

  if (!issuerValidation.valid) {
    throw new Error(`Issuer address: ${issuerValidation.message}`);
  }

  try {
    const account = await runHorizonRequest(
      getHorizonServer(network).loadAccount(accountAddress.trim()),
      { signal }
    );
    const normalizedCode = assetCode.trim().toUpperCase();
    const normalizedIssuer = issuerAddress.trim();
    const exists = account.balances.some(
      (balance) =>
        balance.asset_type !== "native" &&
        balance.asset_type !== "liquidity_pool_shares" &&
        balance.asset_code.toUpperCase() === normalizedCode &&
        balance.asset_issuer === normalizedIssuer
    );

    return {
      exists,
      message: exists
        ? `Trustline found for ${normalizedCode}.`
        : `No ${normalizedCode} trustline found for this account.`
    };
  } catch (error) {
    if (isCancelledError(error)) {
      throw error;
    }

    if (isTimeoutError(error)) {
      throw new Error("The Horizon trustline request timed out. Try again.");
    }

    if (getResponseStatus(error) === 404) {
      throw new Error(
        network === "testnet"
          ? "Account not found on Stellar testnet. Fund it before checking trustlines."
          : "Account not found on Stellar mainnet."
      );
    }

    throw new Error("Could not check trustline through Horizon. Try again shortly.");
  }
}

// TODO(issue #5): Add USDC trustline preset for Stellar mainnet and testnet.
