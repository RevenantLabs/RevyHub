import { ArrowLeftRight } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/offer-inspector/copy";

export function OfferInspectorEmptyState() {
  return (
    <EmptyState icon={ArrowLeftRight} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}

