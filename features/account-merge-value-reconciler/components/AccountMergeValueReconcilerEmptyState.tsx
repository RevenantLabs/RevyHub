import { GitMerge } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "../copy";

export function AccountMergeValueReconcilerEmptyState() {
  return <EmptyState icon={GitMerge} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
