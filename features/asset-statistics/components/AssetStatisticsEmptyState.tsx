import { ChartBarBig } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/asset-statistics/copy";

export function AssetStatisticsEmptyState() {
  return (
    <EmptyState icon={ChartBarBig} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
