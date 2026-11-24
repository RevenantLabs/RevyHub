"use client"

import { Card } from "@/core/ui/Card"
import { SkeletonRows } from "@/core/ui/Skeleton"
import { StatusMessage } from "@/core/ui/StatusMessage"
import { Sep38QuoteExpiryAuditorEmptyState } from "@/features/sep38-quote-expiry-auditor/components/Sep38QuoteExpiryAuditorEmptyState"
import { Sep38QuoteExpiryAuditorForm } from "@/features/sep38-quote-expiry-auditor/components/Sep38QuoteExpiryAuditorForm"
import { Sep38QuoteExpiryAuditorResult } from "@/features/sep38-quote-expiry-auditor/components/Sep38QuoteExpiryAuditorResult"
import { errorCopy } from "@/features/sep38-quote-expiry-auditor/copy"
import { useSep38QuoteExpiryAuditor } from "@/features/sep38-quote-expiry-auditor/hooks/useSep38QuoteExpiryAuditor"

export function Sep38QuoteExpiryAuditorPanel() {
  const { state, submit, redactions } = useSep38QuoteExpiryAuditor()

  return (
    <div className="space-y-5">
      <Card>
        <Sep38QuoteExpiryAuditorForm key={redactions} onSubmit={submit} pending={state.status === "loading"} />
      </Card>
      {state.status === "loading" ? (
        <Card>
          <SkeletonRows rows={4} />
        </Card>
      ) : null}
      {state.status === "error" ? (
        <StatusMessage type="error" title={errorCopy[state.code].title} description={errorCopy[state.code].description} />
      ) : null}
      {state.status === "success" ? <Sep38QuoteExpiryAuditorResult result={state.result} /> : null}
      {state.status === "idle" ? <Sep38QuoteExpiryAuditorEmptyState /> : null}
    </div>
  )
}
