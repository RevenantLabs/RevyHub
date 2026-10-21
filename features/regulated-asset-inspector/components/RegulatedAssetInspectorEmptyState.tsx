import { ShieldAlert } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/regulated-asset-inspector/copy";

export function RegulatedAssetInspectorEmptyState() {
  return <EmptyState icon={ShieldAlert} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
