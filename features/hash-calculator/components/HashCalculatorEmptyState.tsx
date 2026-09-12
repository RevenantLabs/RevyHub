import { Hash } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/hash-calculator/copy";

/** Pre-interaction empty state view. */
export function HashCalculatorEmptyState() {
  return (
    <EmptyState
      icon={Hash}
      title={copy.emptyTitle}
      description={copy.emptyDescription}
    />
  );
}
