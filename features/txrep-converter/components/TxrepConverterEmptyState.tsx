import { ArrowLeftRight } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/txrep-converter/copy";

export function TxrepConverterEmptyState() {
  return <EmptyState icon={ArrowLeftRight} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
