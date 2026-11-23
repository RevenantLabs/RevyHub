import { ClipboardCheck } from "lucide-react"
import { EmptyState } from "@/core/ui/EmptyState"
import { copy } from "@/features/sep31-field-readiness-checker/copy"

export function Sep31FieldReadinessCheckerEmptyState() {
  return <EmptyState icon={ClipboardCheck} title={copy.emptyTitle} description={copy.emptyDescription} />
}
