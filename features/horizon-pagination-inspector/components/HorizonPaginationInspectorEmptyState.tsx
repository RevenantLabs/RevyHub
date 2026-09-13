import { ListOrdered } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/horizon-pagination-inspector/copy";

export function HorizonPaginationInspectorEmptyState() {
  return (
    <EmptyState icon={ListOrdered} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
