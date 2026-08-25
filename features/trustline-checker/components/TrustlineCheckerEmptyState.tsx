import { BadgeCheck } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/trustline-checker/copy";

export function TrustlineCheckerEmptyState() {
  return (
    <EmptyState icon={BadgeCheck} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
