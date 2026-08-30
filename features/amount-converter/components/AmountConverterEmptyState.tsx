import { Calculator } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/amount-converter/copy";

export function AmountConverterEmptyState() {
  return (
    <EmptyState icon={Calculator} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
