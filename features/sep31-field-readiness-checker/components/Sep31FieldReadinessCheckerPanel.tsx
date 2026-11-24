"use client"

import { Card } from "@/core/ui/Card"
import { SkeletonRows } from "@/core/ui/Skeleton"
import { StatusMessage } from "@/core/ui/StatusMessage"
import { Sep31FieldReadinessCheckerEmptyState } from "@/features/sep31-field-readiness-checker/components/Sep31FieldReadinessCheckerEmptyState"
import { Sep31FieldReadinessCheckerForm } from "@/features/sep31-field-readiness-checker/components/Sep31FieldReadinessCheckerForm"
import { Sep31FieldReadinessCheckerResult } from "@/features/sep31-field-readiness-checker/components/Sep31FieldReadinessCheckerResult"
import { errorCopy } from "@/features/sep31-field-readiness-checker/copy"
import { useSep31FieldReadinessChecker } from "@/features/sep31-field-readiness-checker/hooks/useSep31FieldReadinessChecker"

export function Sep31FieldReadinessCheckerPanel() {
  const { state, submit, redactions } = useSep31FieldReadinessChecker()

  return (
    <div className="space-y-5">
      <Card>
        <Sep31FieldReadinessCheckerForm key={redactions} onSubmit={submit} pending={state.status === "loading"} />
      </Card>
      {state.status === "loading" ? (
        <Card>
          <SkeletonRows rows={4} />
        </Card>
      ) : null}
      {state.status === "error" ? (
        <StatusMessage type="error" title={errorCopy[state.code].title} description={errorCopy[state.code].description} />
      ) : null}
      {state.status === "success" ? <Sep31FieldReadinessCheckerResult result={state.result} /> : null}
      {state.status === "idle" ? <Sep31FieldReadinessCheckerEmptyState /> : null}
    </div>
  )
}
