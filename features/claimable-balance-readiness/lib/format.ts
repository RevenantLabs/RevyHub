import { formatAmount as formatBalanceAmount } from "@/features/balance-viewer/lib/format";
import { branchOutcomeLabel, verdictLabel } from "@/features/claimable-balance-readiness/copy";
import type {
  BranchOutcome,
  ClaimableBalanceReadinessResult,
  ReadinessVerdictKind
} from "@/features/claimable-balance-readiness/types";

export function formatAmount(value: string): string {
  return formatBalanceAmount(value);
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toISOString().replace("T", " ").replace(".000Z", " UTC");
}

export function formatBalanceHeading(result: ClaimableBalanceReadinessResult): string {
  return `${formatAmount(result.amount)} ${result.asset.label}`;
}

export function formatVerdict(kind: ReadinessVerdictKind): string {
  return verdictLabel(kind);
}

export function formatBranchOutcome(outcome: BranchOutcome): string {
  return branchOutcomeLabel(outcome);
}

export function formatCreationContext(
  creationTime: string | null,
  reliable: boolean
): string {
  if (!reliable || !creationTime) {
    return "Unavailable";
  }
  return formatTimestamp(creationTime);
}
