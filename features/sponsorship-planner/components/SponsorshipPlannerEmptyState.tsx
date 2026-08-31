import { Handshake } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/sponsorship-planner/copy";

export function SponsorshipPlannerEmptyState() {
  return (
    <EmptyState icon={Handshake} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
