import { GitMerge } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/account-merge-preflight/copy";

export function AccountMergePreflightEmptyState() {
  return (
    <EmptyState icon={GitMerge} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
