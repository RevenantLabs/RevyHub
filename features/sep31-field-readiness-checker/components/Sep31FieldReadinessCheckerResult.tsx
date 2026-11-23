import { Card, CardHeader, CardTitle } from "@/core/ui/Card"
import { FieldReadinessRows } from "@/features/sep31-field-readiness-checker/components/FieldReadinessRows"
import { ReadinessSummary } from "@/features/sep31-field-readiness-checker/components/ReadinessSummary"
import { copy } from "@/features/sep31-field-readiness-checker/copy"
import type { Sep31Result } from "@/features/sep31-field-readiness-checker/types"

export function Sep31FieldReadinessCheckerResult({ result }: { result: Sep31Result }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <ReadinessSummary result={result} />
      <FieldReadinessRows fields={result.fields} />
    </Card>
  )
}
