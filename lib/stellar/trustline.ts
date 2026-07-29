import { getHorizonServer, STELLAR_NETWORK, type StellarNetwork } from "@/lib/stellar/horizon";
import { validatePublicKey } from "@/lib/stellar/validateAddress";
import { getResponseStatus } from "@/lib/stellar/account";

export interface TrustlineCheck {
  exists: boolean;
  message: string;
  notFound?: boolean;
}

export async function checkTrustline(
  accountAddress: string,
  assetCode: string,
  issuerAddress: string,
  network: StellarNetwork = STELLAR_NETWORK
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
    const account = await getHorizonServer(network).loadAccount(accountAddress.trim());
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
      notFound: false,
      message: exists
        ? `Trustline found for ${normalizedCode}.`
        : `No ${normalizedCode} trustline found for this account.`
    };
  } catch (error) {
    if (getResponseStatus(error) === 404) {
      return {
        exists: false,
        notFound: true,
        message: "The account was not found on Stellar testnet."
      };
    }

    throw new Error("Could not check trustline through Horizon. Try again shortly.");
  }
}

// TODO(issue #5): Add USDC trustline preset for Stellar mainnet and testnet.
