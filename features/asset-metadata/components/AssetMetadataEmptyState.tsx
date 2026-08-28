import { FileBadge } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/asset-metadata/copy";

export function AssetMetadataEmptyState() {
  return (
    <EmptyState icon={FileBadge} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
