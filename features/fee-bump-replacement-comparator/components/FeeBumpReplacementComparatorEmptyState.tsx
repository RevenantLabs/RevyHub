import { ArrowLeftRight } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/fee-bump-replacement-comparator/copy";

export function FeeBumpReplacementComparatorEmptyState() {
  return (
    <EmptyState icon={ArrowLeftRight} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
