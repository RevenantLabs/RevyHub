import { Sparkles } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/contract-metadata-viewer/copy";

export function ContractMetadataViewerEmptyState() {
  return (
    <EmptyState icon={Sparkles} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
