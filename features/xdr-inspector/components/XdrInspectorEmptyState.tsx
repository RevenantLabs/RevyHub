import { FileSearch } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/xdr-inspector/copy";

export function XdrInspectorEmptyState() {
  return (
    <EmptyState icon={FileSearch} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
