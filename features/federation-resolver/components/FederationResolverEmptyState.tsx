import { AtSign } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/federation-resolver/copy";

export function FederationResolverEmptyState() {
  return <EmptyState icon={AtSign} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
