import { Card, CardHeader, CardTitle } from "@/core/ui/Card"
import { StatusMessage } from "@/core/ui/StatusMessage"
import { QuoteExpiryStatus } from "@/features/sep38-quote-expiry-auditor/components/QuoteExpiryStatus"
import { QuoteTermsTable } from "@/features/sep38-quote-expiry-auditor/components/QuoteTermsTable"
import { copy } from "@/features/sep38-quote-expiry-auditor/copy"
import type { Sep38Result } from "@/features/sep38-quote-expiry-auditor/types"

export function Sep38QuoteExpiryAuditorResult({ result }: { result: Sep38Result }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      {result.completeness === "incomplete" ? (
        <StatusMessage type="warning" title={copy.incompleteTitle} description={copy.incompleteDescription} />
      ) : null}
      <QuoteTermsTable terms={result.terms} />
      <QuoteExpiryStatus expiry={result.expiry} />
    </Card>
  )
}
