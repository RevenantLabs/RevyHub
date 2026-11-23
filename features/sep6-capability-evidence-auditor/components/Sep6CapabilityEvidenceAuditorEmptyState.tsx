import { ShieldCheck } from "lucide-react"
import { EmptyState } from "@/core/ui/EmptyState"
import { copy } from "@/features/sep6-capability-evidence-auditor/copy"

export function Sep6CapabilityEvidenceAuditorEmptyState() {
  return <EmptyState icon={ShieldCheck} title={copy.emptyTitle} description={copy.emptyDescription} />
}
