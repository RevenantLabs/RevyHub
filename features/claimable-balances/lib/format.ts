import { formatAmount as formatBalanceAmount } from "@/features/balance-viewer/lib/format";
import type { ClaimableBalanceSummary } from "@/features/claimable-balances/types";

export function formatAmount(value: string): string {
  return formatBalanceAmount(value);
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toISOString().replace("T", " ").replace(".000Z", " UTC");
}

export function formatBalanceHeading(balance: ClaimableBalanceSummary): string {
  return `${formatAmount(balance.amount)} ${balance.asset.label}`;
}

export function formatClaimantStatus(claimableNow: boolean): string {
  return claimableNow ? "Claimable now" : "Not claimable now";
}
