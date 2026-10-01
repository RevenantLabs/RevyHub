import { KeyRound } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/testnet-keypair-generator/copy";

export function TestnetKeypairGeneratorEmptyState() {
  return (
    <EmptyState
      icon={KeyRound}
      title={copy.emptyTitle}
      description={copy.emptyDescription}
    />
  );
}
