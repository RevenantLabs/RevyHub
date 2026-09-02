import { Sparkles } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/contract-events/copy";

export function ContractEventsEmptyState() {
  return <EmptyState icon={Sparkles} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
