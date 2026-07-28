import { getHorizonServer, STELLAR_NETWORK, type StellarNetwork } from "@/lib/stellar/horizon";
import { validatePublicKey } from "@/lib/stellar/validateAddress";
import { getResponseStatus } from "@/lib/stellar/account";

// ── Asset presets ────────────────────────────────────────────────────────

/**
 * Network-aware USDC issuer addresses on Stellar.
 * - Mainnet: Circle's USDC issuer
 * - Testnet: Circle's testnet USDC issuer
 */
export const USDC_PRESETS: Record<StellarNetwork, { code: string; issuer: string }> = {
  mainnet: {
    code: "USDC",
    issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
  },
  testnet: {
    code: "USDC",
    issuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
  }
};

/** Return the USDC preset for the given network. */
export function getUSDCPreset(network: StellarNetwork): { code: string; issuer: string } {
  return USDC_PRESETS[network];
}

/** Authorization state for a trustline as reported by Horizon. */
export interface TrustlineAuthorization {
  /** Fully authorized — the issuer has approved this trustline. */
  authorized: boolean;
  /** Authorized to maintain liabilities only — selling offers are allowed but new buying is not. */
  authorizedToMaintainLiabilities: boolean;
  /** Clawback is enabled on this trustline. */
  clawbackEnabled: boolean;
}

/** Trustline liability summary returned by Horizon. */
export interface TrustlineLiabilities {
  /** Amount of this asset currently being bought (buying offers). */
  buying: string;
  /** Amount of this asset currently being sold (selling offers). */
  selling: string;
}

/** Expanded result of a trustline check. */
export interface TrustlineCheck {
  exists: boolean;
  message: string;
  /** The current balance held in this trustline. Only present when the trustline exists. */
  balance?: string;
  /** The trust limit set for this trustline. Only present when the trustline exists. */
  limit?: string;
  /** Authorization flags from Horizon. Only present when the trustline exists. */
  authorization?: TrustlineAuthorization;
  /** Current buying and selling liabilities. Only present when the trustline exists. */
  liabilities?: TrustlineLiabilities;
  /** The last ledger in which this trustline was modified. Only present when the trustline exists. */
  lastModifiedLedger?: number;
}

/**
 * Look up a trustline on the given account for a specific issued asset.
 *
 * Returns `{ exists: true }` with balance, limit, authorization, and liability
 * details when the trustline is found, or `{ exists: false }` when it is not.
 */
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

    const trustline = account.balances.find(
      (b) =>
        b.asset_type !== "native" &&
        b.asset_type !== "liquidity_pool_shares" &&
        (b as { asset_code: string }).asset_code.toUpperCase() === normalizedCode &&
        (b as { asset_issuer: string }).asset_issuer === normalizedIssuer
    ) as
      | {
          asset_code: string;
          asset_issuer: string;
          balance: string;
          limit: string;
          is_authorized: boolean;
          is_authorized_to_maintain_liabilities: boolean;
          is_clawback_enabled: boolean;
          buying_liabilities: string;
          selling_liabilities: string;
          last_modified_ledger: number;
        }
      | undefined;

    if (!trustline) {
      return {
        exists: false,
        message: `No ${normalizedCode} trustline found for this account.`
      };
    }

    return {
      exists: true,
      message: `Trustline found for ${normalizedCode}.`,
      balance: trustline.balance,
      limit: trustline.limit,
      authorization: {
        authorized: trustline.is_authorized,
        authorizedToMaintainLiabilities: trustline.is_authorized_to_maintain_liabilities,
        clawbackEnabled: trustline.is_clawback_enabled
      },
      liabilities: {
        buying: trustline.buying_liabilities,
        selling: trustline.selling_liabilities
      },
      lastModifiedLedger: trustline.last_modified_ledger
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

