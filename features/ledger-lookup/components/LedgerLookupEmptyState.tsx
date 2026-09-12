import { Layers } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/ledger-lookup/copy";

/** Renders placeholder instructions when no ledger lookup has been initiated. */
export function LedgerLookupEmptyState() {
  return (
    <EmptyState icon={Layers} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
