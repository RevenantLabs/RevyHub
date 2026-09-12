import { KeyRound } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/strkey-inspector/copy";

export function StrkeyInspectorEmptyState() {
  return (
    <EmptyState
      icon={KeyRound}
      title={copy.emptyTitle}
      description={copy.emptyDescription}
    />
  );
}
