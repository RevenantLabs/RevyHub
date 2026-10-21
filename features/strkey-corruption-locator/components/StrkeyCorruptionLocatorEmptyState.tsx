import { ScanSearch } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/strkey-corruption-locator/copy";

export function StrkeyCorruptionLocatorEmptyState() {
  return (
    <EmptyState icon={ScanSearch} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
