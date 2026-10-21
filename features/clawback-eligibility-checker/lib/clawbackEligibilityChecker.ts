import type { StellarNetwork } from "@/core/network/types";
import { fetchHolderTrustlineFlag } from "./holder-trustline-flag";
import { fetchIssuerClawbackFlag } from "./issuer-clawback-flag";
import { mergeEligibility } from "./eligibility-merge";
import type { ClawbackEligibilityReport, ParsedInput } from "../types";

/**
 * Runs both account fetches in parallel and always reports both outcomes —
 * one failing does not abort the other, matching the acceptance criteria.
 * Only the two field-level validations in `schema.ts` can fail this
 * function's own `Result`; once a fetch is attempted, this always resolves
 * to a report (which may contain per-side failures).
 */
export async function checkClawbackEligibility(
  input: ParsedInput,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<ClawbackEligibilityReport> {
  const [issuer, holder] = await Promise.all([
    fetchIssuerClawbackFlag(input.issuerAccountId, network, signal),
    fetchHolderTrustlineFlag(input.holderAccountId, input.issuerAccountId, input.assetCode, network, signal)
  ]);

  return {
    issuerAccountId: input.issuerAccountId,
    holderAccountId: input.holderAccountId,
    assetCode: input.assetCode,
    issuer,
    holder,
    verdict: mergeEligibility(issuer, holder)
  };
}
