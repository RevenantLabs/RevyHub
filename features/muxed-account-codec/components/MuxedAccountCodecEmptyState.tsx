import { ArrowLeftRight } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/muxed-account-codec/copy";

export function MuxedAccountCodecEmptyState() {
  return (
    <EmptyState
      icon={ArrowLeftRight}
      title={copy.emptyTitle}
      description={copy.emptyDescription}
    />
  );
}
