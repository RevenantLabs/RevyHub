import { Sparkles } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/sponsored-reserves/copy";

export function SponsoredReservesEmptyState() {
  return (
    <EmptyState icon={Sparkles} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
