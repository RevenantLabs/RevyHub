import type {
  OperationSource,
  SourceFilter,
  SourceGroup
} from "@/features/operation-source-map/types";

/**
 * Applies the inherited/overridden filter.
 *
 * Filtering is a pure function of the map and the current choice rather than a
 * second copy of the rows held in state, so the filtered view can never drift
 * from the map it came from.
 */
export function filterOperations(
  operations: OperationSource[],
  filter: SourceFilter
): OperationSource[] {
  if (filter === "all") return operations;
  if (filter === "inherited") return operations.filter((operation) => operation.inherited);
  return operations.filter((operation) => !operation.inherited);
}

/** Operations are numbered from one for the reader; indexes stay zero-based. */
export function formatIndex(index: number): string {
  return String(index + 1);
}

export function formatOperationIndexes(group: SourceGroup): string {
  return group.operationIndexes.map(formatIndex).join(", ");
}

export function formatOriginCounts(group: SourceGroup): string {
  const parts: string[] = [];
  if (group.overriddenCount) parts.push(`${group.overriddenCount} overridden`);
  if (group.inheritedCount) parts.push(`${group.inheritedCount} inherited`);
  return parts.join(" · ");
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
