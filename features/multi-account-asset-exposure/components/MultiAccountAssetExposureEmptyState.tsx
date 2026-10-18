import { Table2 } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "../copy";
export function MultiAccountAssetExposureEmptyState() {
  return <EmptyState icon={Table2} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
