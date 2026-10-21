import { History } from "lucide-react";
import { EmptyState } from "@/core/ui";
import { copy } from "../copy";

export function SorobanRestoreReadinessEmptyState() {
  return <EmptyState icon={History} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
