import { Shield } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/asset-flags-inspector/copy";

export function AssetFlagsInspectorEmptyState() {
  return (
    <EmptyState icon={Shield} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
