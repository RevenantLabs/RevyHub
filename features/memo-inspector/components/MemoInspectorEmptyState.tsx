import { Tags } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/memo-inspector/copy";

export function MemoInspectorEmptyState() {
  return <EmptyState icon={Tags} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
