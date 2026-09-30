import { Sparkles } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/transaction-timebound-planner/copy";

export function TransactionTimeboundPlannerEmptyState() {
  return (
    <EmptyState icon={Sparkles} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
