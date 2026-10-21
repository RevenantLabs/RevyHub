import { Fingerprint } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/signing-payload-inspector/copy";

export function SigningPayloadInspectorEmptyState() {
  return <EmptyState icon={Fingerprint} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
