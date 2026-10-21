import { ShieldAlert } from "lucide-react";
import { EmptyState } from "@/core/ui";
import { copy } from "../copy";

export function ClawbackEligibilityCheckerEmptyState() {
  return <EmptyState icon={ShieldAlert} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
