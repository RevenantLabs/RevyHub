import { CircleDollarSign } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/balance-viewer/copy";

export function BalanceViewerEmptyState() {
  return (
    <EmptyState
      icon={CircleDollarSign}
      title={copy.emptyTitle}
      description={copy.emptyDescription}
    />
  );
}
