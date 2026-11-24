import { DataList } from "@/core/ui/DataList"
import { copy } from "@/features/sep38-quote-expiry-auditor/copy"
import { formatAmount, formatIdentifier, formatMissingTerms } from "@/features/sep38-quote-expiry-auditor/lib/format"
import type { QuoteTerms } from "@/features/sep38-quote-expiry-auditor/types"

export function QuoteTermsTable({ terms }: { terms: QuoteTerms }) {
  return (
    <DataList
      items={[
        { label: "Quote id", value: formatIdentifier(terms.id), mono: true },
        { label: "Sell asset", value: formatIdentifier(terms.sellAsset), mono: true },
        { label: "Buy asset", value: formatIdentifier(terms.buyAsset), mono: true },
        { label: "Sell amount", value: formatAmount(terms.sellAmount), mono: true },
        { label: "Buy amount", value: formatAmount(terms.buyAmount), mono: true },
        { label: "Price", value: formatAmount(terms.price), mono: true },
        { label: "Fee total", value: formatAmount(terms.feeTotal), mono: true },
        { label: "Fee asset", value: formatIdentifier(terms.feeAsset), mono: true },
        { label: "Missing terms", value: formatMissingTerms(terms) },
        {
          label: "Fee currency",
          value: terms.feeCurrencyDiffers ? copy.feeDiffers : "Fee asset matches the sold asset, or no fee asset was declared"
        },
        {
          label: copy.unsupportedTitle,
          value: terms.unsupportedFields.length === 0 ? "none" : terms.unsupportedFields.join(", ")
        }
      ]}
    />
  )
}
