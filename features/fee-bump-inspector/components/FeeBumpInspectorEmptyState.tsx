import { Layers } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/fee-bump-inspector/copy";

export function FeeBumpInspectorEmptyState() {
  return (
    <EmptyState icon={Layers} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
