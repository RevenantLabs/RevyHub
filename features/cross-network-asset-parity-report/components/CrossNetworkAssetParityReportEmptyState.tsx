import { GitCompare } from "lucide-react"
import { EmptyState } from "@/core/ui/EmptyState"
import { copy } from "@/features/cross-network-asset-parity-report/copy"

export function CrossNetworkAssetParityReportEmptyState() {
  return <EmptyState icon={GitCompare} title={copy.emptyTitle} description={copy.emptyDescription} />
}
