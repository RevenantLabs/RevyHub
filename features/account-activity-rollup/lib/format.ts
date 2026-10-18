import type { CoverageWindow } from "@/features/account-activity-rollup/types";
import { copy } from "@/features/account-activity-rollup/copy";

export function formatOperationType(type: string): string {
  return type.replace(/_/g, " ");
}
export function formatCoverage(coverage: CoverageWindow): string {
  return `${copy.coveragePrefix} ${coverage.records} ${copy.coverageSuffix} ${coverage.pages} ${coverage.pages === 1 ? copy.coveragePage : copy.coveragePages}.`;
}
export function formatDayRange(coverage: CoverageWindow): string | null {
  if (!coverage.oldestDay || !coverage.newestDay) return null;
  return coverage.oldestDay === coverage.newestDay ? coverage.oldestDay : `${coverage.oldestDay} – ${coverage.newestDay}`;
}
