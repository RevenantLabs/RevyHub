import { Braces } from "lucide-react";
import { EmptyState } from "@/core/ui";
import { copy } from "../copy";

export function ContractCallArgumentCheckerEmptyState() {
  return <EmptyState icon={Braces} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
