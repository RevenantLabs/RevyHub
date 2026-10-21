import { PackagePlus } from "lucide-react";
import { EmptyState } from "@/core/ui";
import { copy } from "../copy";

export function ContractDeployPreviewEmptyState() {
  return <EmptyState icon={PackagePlus} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
