import { History } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/effects-timeline/copy";

export function EffectsTimelineEmptyState() {
  return (
    <EmptyState icon={History} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
