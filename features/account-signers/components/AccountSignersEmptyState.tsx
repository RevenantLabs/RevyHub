import { KeyRound } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/account-signers/copy";

export function AccountSignersEmptyState() {
  return (
    <EmptyState icon={KeyRound} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
