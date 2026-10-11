import { ListFilter } from "lucide-react";
import { EmptyState } from "@/core/ui";
import { copy } from "@/features/horizon-pagination-inspector/copy";

/** Displays initial guidance before any Horizon collection has been pasted or inspected. */
export function HorizonPaginationInspectorEmptyState() {
  return (
    <EmptyState
      icon={ListFilter}
      title={copy.emptyTitle}
      description={copy.emptyDescription}
    />
  );
}
