import { Timer } from "lucide-react"
import { EmptyState } from "@/core/ui/EmptyState"
import { copy } from "@/features/sep38-quote-expiry-auditor/copy"

export function Sep38QuoteExpiryAuditorEmptyState() {
  return <EmptyState icon={Timer} title={copy.emptyTitle} description={copy.emptyDescription} />
}
