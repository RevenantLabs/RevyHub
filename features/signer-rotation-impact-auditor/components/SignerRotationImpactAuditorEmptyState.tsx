import { KeyRound } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/signer-rotation-impact-auditor/copy";

export function SignerRotationImpactAuditorEmptyState() {
  return (
    <EmptyState icon={KeyRound} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
