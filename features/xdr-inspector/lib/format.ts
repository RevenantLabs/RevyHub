import type {
  EnvelopeVariant,
  MemoSummary,
  TimeBoundsSummary
} from "@/features/xdr-inspector/types";

const VARIANT_LABELS: Record<EnvelopeVariant, string> = {
  "classic-v0": "Classic transaction (v0 envelope)",
  "classic-v1": "Classic transaction (v1 envelope)",
  "fee-bump": "Fee-bump transaction"
};

export function formatVariant(variant: EnvelopeVariant): string {
  return VARIANT_LABELS[variant];
}

/** Stellar time bounds are Unix seconds; 0 means "unbounded on this side". */
export function formatTimeBound(seconds: string): string {
  if (seconds === "0") return "Unbounded";

  const value = Number(seconds);
  if (!Number.isFinite(value)) return seconds;

  return new Date(value * 1000).toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC");
}

export function describeTimeBounds(bounds: TimeBoundsSummary | null): string {
  if (!bounds) return "None — valid indefinitely";
  return `${formatTimeBound(bounds.minTime)} → ${formatTimeBound(bounds.maxTime)}`;
}

/** Reports whether the upper time bound has already passed. */
export function isExpired(bounds: TimeBoundsSummary | null, now: number = Date.now()): boolean {
  if (!bounds || bounds.maxTime === "0") return false;
  const maxTime = Number(bounds.maxTime);
  return Number.isFinite(maxTime) && maxTime * 1000 < now;
}

export function formatMemo(memo: MemoSummary): string {
  if (memo.type === "none" || memo.value === null) return "None";
  return `${memo.value} (${memo.type})`;
}

const OPERATION_LABELS: Record<string, string> = {
  createAccount: "Create account",
  payment: "Payment",
  pathPaymentStrictReceive: "Path payment (strict receive)",
  pathPaymentStrictSend: "Path payment (strict send)",
  manageSellOffer: "Manage sell offer",
  manageBuyOffer: "Manage buy offer",
  createPassiveSellOffer: "Create passive sell offer",
  setOptions: "Set options",
  changeTrust: "Change trust",
  allowTrust: "Allow trust",
  accountMerge: "Account merge",
  inflation: "Inflation",
  manageData: "Manage data",
  bumpSequence: "Bump sequence",
  createClaimableBalance: "Create claimable balance",
  claimClaimableBalance: "Claim claimable balance",
  beginSponsoringFutureReserves: "Begin sponsoring future reserves",
  endSponsoringFutureReserves: "End sponsoring future reserves",
  revokeSponsorship: "Revoke sponsorship",
  clawback: "Clawback",
  clawbackClaimableBalance: "Clawback claimable balance",
  setTrustLineFlags: "Set trustline flags",
  liquidityPoolDeposit: "Liquidity pool deposit",
  liquidityPoolWithdraw: "Liquidity pool withdraw",
  invokeHostFunction: "Invoke host function (Soroban)",
  extendFootprintTtl: "Extend footprint TTL (Soroban)",
  restoreFootprint: "Restore footprint (Soroban)"
};

/** Falls back to a readable form so a new protocol operation never breaks the page. */
export function formatOperationType(name: string): string {
  return OPERATION_LABELS[name] ?? name.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
}
