import { Calculator } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/reserve-capacity-planner/copy";

export function ReserveCapacityPlannerEmptyState() {
  return <EmptyState icon={Calculator} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
