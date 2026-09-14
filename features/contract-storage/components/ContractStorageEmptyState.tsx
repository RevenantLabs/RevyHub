import { Database } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/contract-storage/copy";

export function ContractStorageEmptyState() {
  return (
    <EmptyState icon={Database} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
