import { ChartNoAxesCombined } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/account-activity-rollup/copy";

export function AccountActivityRollupEmptyState() {
  return <EmptyState icon={ChartNoAxesCombined} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
