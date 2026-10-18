import { ShieldCheck } from "lucide-react";
import { EmptyState } from "@/core/ui";
import { copy } from "../copy";

export function Sep7RequestPolicyAuditorEmptyState() {
  return <EmptyState icon={ShieldCheck} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
