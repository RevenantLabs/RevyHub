import { ListOrdered } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/sequence-inspector/copy";

export function SequenceInspectorEmptyState() {
  return (
    <EmptyState icon={ListOrdered} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
