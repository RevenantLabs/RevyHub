import { BookOpenCheck } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/result-code-explainer/copy";

export function ResultCodeExplainerEmptyState() {
  return (
    <EmptyState icon={BookOpenCheck} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
