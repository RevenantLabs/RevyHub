import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/asset-statistics/copy";

export function AssetStatisticsEmptyState() {
  return (
    <EmptyState icon={BarChart3} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
