import { Activity } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/horizon-health/copy";

/** Renders empty state before a diagnostic has been initiated. */
export function HorizonHealthEmptyState() {
  return (
    <EmptyState
      icon={Activity}
      title={copy.emptyTitle}
      description={copy.emptyDescription}
    />
  );
}
