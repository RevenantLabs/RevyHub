import { History } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/operation-browser/copy";

export function OperationBrowserEmptyState() {
  return (
    <EmptyState icon={History} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
