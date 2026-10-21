import type { EligibilityVerdict, FetchOutcome, HolderSignal, IssuerSignal } from "../types";

/**
 * Merges the two independent signals into one verdict. Eligibility is only
 * determined when both signals agree; a trustline created before the issuer
 * enabled `auth_clawback_enabled` can carry its own clawback-enabled flag
 * independent of the issuer's current setting — see the README — so a
 * disagreement is reported explicitly rather than resolved by inference.
 */
export function mergeEligibility(
  issuer: FetchOutcome<IssuerSignal>,
  holder: FetchOutcome<HolderSignal>
): EligibilityVerdict {
  if (!issuer.ok || !holder.ok) return { kind: "unknown" };

  const issuerSaysEnabled = issuer.value.authClawbackEnabled;
  const holderSaysEnabled = holder.value.clawbackEnabled;

  if (issuerSaysEnabled !== holderSaysEnabled) {
    return { kind: "disagreement", issuerSaysEnabled, holderSaysEnabled };
  }

  return issuerSaysEnabled ? { kind: "eligible" } : { kind: "not_eligible" };
}
