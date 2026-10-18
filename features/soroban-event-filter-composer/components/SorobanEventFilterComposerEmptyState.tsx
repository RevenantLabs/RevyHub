import { Filter } from "lucide-react";
import { EmptyState } from "@/core/ui";
import { copy } from "../copy";

export function SorobanEventFilterComposerEmptyState() {
  return <EmptyState icon={Filter} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
