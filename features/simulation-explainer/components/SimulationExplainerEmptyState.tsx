import { Activity } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/simulation-explainer/copy";

export function SimulationExplainerEmptyState() {
  return (
    <EmptyState icon={Activity} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
