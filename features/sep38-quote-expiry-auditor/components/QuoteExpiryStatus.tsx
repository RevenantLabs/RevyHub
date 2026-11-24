import { DataList } from "@/core/ui/DataList"
import { copy } from "@/features/sep38-quote-expiry-auditor/copy"
import { formatExpiry } from "@/features/sep38-quote-expiry-auditor/lib/format"
import type { QuoteExpiry } from "@/features/sep38-quote-expiry-auditor/types"

export function QuoteExpiryStatus({ expiry }: { expiry: QuoteExpiry }) {
  return (
    <section aria-label={copy.expiryTitle}>
      <DataList
        items={[
          { label: copy.expiryTitle, value: formatExpiry(expiry) },
          { label: "Expires at", value: expiry.expiresAt, mono: true },
          { label: "Evaluated at", value: expiry.evaluationTime, mono: true }
        ]}
      />
    </section>
  )
}
