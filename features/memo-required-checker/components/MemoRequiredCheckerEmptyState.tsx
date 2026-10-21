import { StickyNote } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/memo-required-checker/copy";

export function MemoRequiredCheckerEmptyState() {
  return <EmptyState icon={StickyNote} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
