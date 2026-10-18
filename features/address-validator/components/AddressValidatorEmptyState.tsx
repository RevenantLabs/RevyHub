import { ShieldCheck } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/address-validator/copy";

export function AddressValidatorEmptyState() {
  return (
    <EmptyState
      icon={ShieldCheck}
      title={copy.emptyTitle}
      description={copy.emptyDescription}
    />
  );
}
