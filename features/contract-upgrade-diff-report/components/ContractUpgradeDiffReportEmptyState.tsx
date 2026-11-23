import { GitCompareArrows } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/contract-upgrade-diff-report/copy";

export function ContractUpgradeDiffReportEmptyState() {
  return (
    <EmptyState icon={GitCompareArrows} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
