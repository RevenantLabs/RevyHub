import { getHorizonServer, STELLAR_NETWORK, type StellarNetwork } from "@/lib/stellar/horizon";
import { validatePublicKey } from "@/lib/stellar/validateAddress";
import { getResponseStatus } from "@/lib/stellar/account";

export interface TrustlineCheck {
  exists: boolean;
  message: string;
}

export interface TrustlinePreset {
  assetCode: string;
  issuerAddress: string;
}

export const USDC_TRUSTLINE_PRESETS: Record<StellarNetwork, TrustlinePreset> = {
  testnet: {
    assetCode: "USDC",
    issuerAddress: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
  },
  mainnet: {
    assetCode: "USDC",
    issuerAddress: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
  }
};

export async function checkTrustline(
  accountAddress: string,
  assetCode: string,
  issuerAddress: string,
  network: StellarNetwork = STELLAR_NETWORK
): Promise<TrustlineCheck> {
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
      message: exists
        ? `Trustline found for ${normalizedCode}.`
        : `No ${normalizedCode} trustline found for this account.`
    };
  } catch (error) {
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
