import { ListOrdered } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/transaction-sequence-gap-auditor/copy";

export function TransactionSequenceGapAuditorEmptyState() {
  return (
    <EmptyState icon={ListOrdered} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
