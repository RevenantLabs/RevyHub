import { ListChecks } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/batch-address-validator/copy";

export function BatchAddressValidatorEmptyState() {
  return (
    <EmptyState icon={ListChecks} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
