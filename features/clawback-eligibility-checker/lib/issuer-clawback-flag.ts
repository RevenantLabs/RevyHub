import { horizonServer } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import type { FetchOutcome, IssuerSignal } from "../types";
import { toErrorCode } from "./clawbackEligibilityChecker.errors";

/** Reads the issuer's account-level `auth_clawback_enabled` flag. */
export async function fetchIssuerClawbackFlag(
  issuerAccountId: string,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<FetchOutcome<IssuerSignal>> {
  try {
    const account = await horizonServer(network).loadAccount(issuerAccountId);
    void signal;
    return { ok: true, value: { authClawbackEnabled: Boolean(account.flags.auth_clawback_enabled) } };
  } catch (error) {
    return { ok: false, code: toErrorCode(error, "issuer_not_found") };
  }
}
