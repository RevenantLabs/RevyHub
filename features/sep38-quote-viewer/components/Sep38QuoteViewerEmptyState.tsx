import { LineChart } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/sep38-quote-viewer/copy";

export function Sep38QuoteViewerEmptyState() {
  return (
    <EmptyState icon={LineChart} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
