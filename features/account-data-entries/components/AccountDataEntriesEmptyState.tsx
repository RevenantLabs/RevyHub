import { Database } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/account-data-entries/copy";

export function AccountDataEntriesEmptyState() {
  return (
    <EmptyState icon={Database} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
