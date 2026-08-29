import { CalendarClock } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/preconditions-explainer/copy";

export function PreconditionsExplainerEmptyState() {
  return (
    <EmptyState
      icon={CalendarClock}
      title={copy.emptyTitle}
      description={copy.emptyDescription}
    />
  );
}
