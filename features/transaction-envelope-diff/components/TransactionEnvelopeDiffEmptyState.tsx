import { GitCompare } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/transaction-envelope-diff/copy";

export function TransactionEnvelopeDiffEmptyState() {
  return (
    <EmptyState icon={GitCompare} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
