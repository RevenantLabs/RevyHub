import { Ruler } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/transaction-size-analyzer/copy";

export function TransactionSizeAnalyzerEmptyState() {
  return (
    <EmptyState icon={Ruler} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
