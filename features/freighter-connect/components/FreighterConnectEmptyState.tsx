import { WalletCards } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/freighter-connect/copy";

export function FreighterConnectEmptyState() {
  return (
    <EmptyState icon={WalletCards} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
