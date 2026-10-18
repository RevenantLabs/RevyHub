import { GitBranch } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/operation-source-map/copy";

export function OperationSourceMapEmptyState() {
  return (
    <EmptyState icon={GitBranch} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
