"use client"

import { Card } from "@/core/ui/Card"
import { SkeletonRows } from "@/core/ui/Skeleton"
import { StatusMessage } from "@/core/ui/StatusMessage"
import { CrossNetworkAssetParityReportEmptyState } from "@/features/cross-network-asset-parity-report/components/CrossNetworkAssetParityReportEmptyState"
import { CrossNetworkAssetParityReportForm } from "@/features/cross-network-asset-parity-report/components/CrossNetworkAssetParityReportForm"
import { CrossNetworkAssetParityReportResult } from "@/features/cross-network-asset-parity-report/components/CrossNetworkAssetParityReportResult"
import { errorCopy } from "@/features/cross-network-asset-parity-report/copy"
import { useCrossNetworkAssetParityReport } from "@/features/cross-network-asset-parity-report/hooks/useCrossNetworkAssetParityReport"

export function CrossNetworkAssetParityReportPanel() {
  const { state, submit, redactions } = useCrossNetworkAssetParityReport()

  return (
    <div className="space-y-5">
      <Card>
        <CrossNetworkAssetParityReportForm key={redactions} onSubmit={submit} pending={state.status === "loading"} />
      </Card>
      {state.status === "loading" ? (
        <Card>
          <SkeletonRows rows={4} />
        </Card>
      ) : null}
      {state.status === "error" ? (
        <StatusMessage type="error" title={errorCopy[state.code].title} description={errorCopy[state.code].description} />
      ) : null}
      {state.status === "success" ? <CrossNetworkAssetParityReportResult result={state.result} /> : null}
      {state.status === "idle" ? <CrossNetworkAssetParityReportEmptyState /> : null}
    </div>
  )
}
