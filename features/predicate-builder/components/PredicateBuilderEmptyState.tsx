import { Workflow } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/predicate-builder/copy";

export function PredicateBuilderEmptyState() {
  return (
    <EmptyState
      icon={Workflow}
      title={copy.emptyTitle}
      description={copy.emptyDescription}
    />
  );
}
