import { ArrowLeftRight } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/asset-descriptor-codec/copy";

/**
 * Renders the pre-interaction empty state guiding the user to encode or decode an asset.
 */
export function AssetDescriptorCodecEmptyState() {
  return (
    <EmptyState
      icon={ArrowLeftRight}
      title={copy.emptyTitle}
      description={copy.emptyDescription}
    />
  );
}
