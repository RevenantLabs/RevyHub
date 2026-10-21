import { Radio } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/sep24-transaction-status-tracker/copy";

export function Sep24TransactionStatusTrackerEmptyState() {
  return <EmptyState icon={Radio} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
