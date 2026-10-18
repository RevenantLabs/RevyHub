import { Fingerprint } from "lucide-react";
import { EmptyState } from "@/core/ui";
import { copy } from "../copy";

export function ContractCodeHashVerifierEmptyState() {
  return <EmptyState icon={Fingerprint} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
