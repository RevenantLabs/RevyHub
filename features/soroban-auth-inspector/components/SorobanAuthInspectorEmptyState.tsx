import { ShieldCheck } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/soroban-auth-inspector/copy";

export function SorobanAuthInspectorEmptyState() {
  return <EmptyState icon={ShieldCheck} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
