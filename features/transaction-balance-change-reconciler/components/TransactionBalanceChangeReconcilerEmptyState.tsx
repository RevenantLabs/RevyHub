import { Scale } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/transaction-balance-change-reconciler/copy";

export function TransactionBalanceChangeReconcilerEmptyState() {
  return (
    <EmptyState icon={Scale} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
