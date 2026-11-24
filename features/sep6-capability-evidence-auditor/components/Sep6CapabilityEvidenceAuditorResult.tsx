import { Card, CardHeader, CardTitle } from "@/core/ui/Card"
import { StatusMessage } from "@/core/ui/StatusMessage"
import { CapabilitySections } from "@/features/sep6-capability-evidence-auditor/components/CapabilitySections"
import { copy } from "@/features/sep6-capability-evidence-auditor/copy"
import type { Sep6Result } from "@/features/sep6-capability-evidence-auditor/types"

export function Sep6CapabilityEvidenceAuditorResult({ result }: { result: Sep6Result }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      {result.completeness === "incomplete" ? (
        <StatusMessage type="warning" title={copy.incompleteTitle} description={copy.incompleteDescription} />
      ) : null}
      <CapabilitySections records={result.records} />
    </Card>
  )
}
