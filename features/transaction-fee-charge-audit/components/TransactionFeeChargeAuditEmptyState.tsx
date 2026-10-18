import { Receipt } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/transaction-fee-charge-audit/copy";

export function TransactionFeeChargeAuditEmptyState() {
  return (
    <EmptyState icon={Receipt} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
