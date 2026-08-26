import { Calculator } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/reserve-calculator/copy";

export function ReserveCalculatorEmptyState() {
  return (
    <EmptyState icon={Calculator} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
