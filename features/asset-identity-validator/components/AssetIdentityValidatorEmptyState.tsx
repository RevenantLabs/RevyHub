import { BadgeCheck } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/asset-identity-validator/copy";

export function AssetIdentityValidatorEmptyState() {
  return (
    <EmptyState icon={BadgeCheck} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
