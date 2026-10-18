import { Coins } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/fee-stats/copy";

export function FeeStatsEmptyState() {
  return <EmptyState icon={Coins} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
