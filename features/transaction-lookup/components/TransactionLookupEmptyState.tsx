import { Search } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/transaction-lookup/copy";

export function TransactionLookupEmptyState() {
  return <EmptyState icon={Search} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
