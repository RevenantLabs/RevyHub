import { horizonServer } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import type { FetchOutcome, HolderSignal } from "../types";
import { toErrorCode } from "./clawbackEligibilityChecker.errors";

interface CreditBalance {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  is_clawback_enabled?: boolean;
}

/**
 * Reads the holder's own trustline-level `is_clawback_enabled` flag for the
 * given asset code (matched against any issuer — the caller already knows
 * which issuer it asked about). A holder with no matching trustline is its
 * own distinct `no_trustline` outcome, not a transport failure.
 */
export async function fetchHolderTrustlineFlag(
  holderAccountId: string,
  issuerAccountId: string,
  assetCode: string,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<FetchOutcome<HolderSignal>> {
  try {
    const account = await horizonServer(network).loadAccount(holderAccountId);
    void signal;
    const balances = account.balances as CreditBalance[];
    const match = balances.find(
      (balance) =>
        balance.asset_type !== "native" &&
        balance.asset_code?.toUpperCase() === assetCode.toUpperCase() &&
        balance.asset_issuer === issuerAccountId
    );
    if (!match) return { ok: false, code: "no_trustline" };
    return { ok: true, value: { clawbackEnabled: match.is_clawback_enabled === true } };
  } catch (error) {
    return { ok: false, code: toErrorCode(error, "holder_not_found") };
  }
}
