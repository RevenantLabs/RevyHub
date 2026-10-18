import { Fingerprint } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/signature-hint-auditor/copy";

export function SignatureHintAuditorEmptyState() {
  return (
    <EmptyState icon={Fingerprint} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
