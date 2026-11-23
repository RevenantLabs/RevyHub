"use client"

import { Card } from "@/core/ui/Card"
import { SkeletonRows } from "@/core/ui/Skeleton"
import { StatusMessage } from "@/core/ui/StatusMessage"
import { Sep6CapabilityEvidenceAuditorEmptyState } from "@/features/sep6-capability-evidence-auditor/components/Sep6CapabilityEvidenceAuditorEmptyState"
import { Sep6CapabilityEvidenceAuditorForm } from "@/features/sep6-capability-evidence-auditor/components/Sep6CapabilityEvidenceAuditorForm"
import { Sep6CapabilityEvidenceAuditorResult } from "@/features/sep6-capability-evidence-auditor/components/Sep6CapabilityEvidenceAuditorResult"
import { errorCopy } from "@/features/sep6-capability-evidence-auditor/copy"
import { useSep6CapabilityEvidenceAuditor } from "@/features/sep6-capability-evidence-auditor/hooks/useSep6CapabilityEvidenceAuditor"

export function Sep6CapabilityEvidenceAuditorPanel() {
  const { state, submit, redactions } = useSep6CapabilityEvidenceAuditor()

  return (
    <div className="space-y-5">
      <Card>
        <Sep6CapabilityEvidenceAuditorForm key={redactions} onSubmit={submit} pending={state.status === "loading"} />
      </Card>
      {state.status === "loading" ? (
        <Card>
          <SkeletonRows rows={4} />
        </Card>
      ) : null}
      {state.status === "error" ? (
        <StatusMessage type="error" title={errorCopy[state.code].title} description={errorCopy[state.code].description} />
      ) : null}
      {state.status === "success" ? <Sep6CapabilityEvidenceAuditorResult result={state.result} /> : null}
      {state.status === "idle" ? <Sep6CapabilityEvidenceAuditorEmptyState /> : null}
    </div>
  )
}
