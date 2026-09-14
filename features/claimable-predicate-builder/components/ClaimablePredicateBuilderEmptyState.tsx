import { Sparkles } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/claimable-predicate-builder/copy";

export function ClaimablePredicateBuilderEmptyState() {
  return (
    <EmptyState icon={Sparkles} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
