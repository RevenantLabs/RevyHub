import { Binary } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/manage-data-codec/copy";

export function ManageDataCodecEmptyState() {
  return (
    <EmptyState icon={Binary} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
