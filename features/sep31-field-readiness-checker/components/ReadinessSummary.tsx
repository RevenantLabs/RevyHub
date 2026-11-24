import { DataList } from "@/core/ui/DataList"
import { formatReadiness } from "@/features/sep31-field-readiness-checker/lib/format"
import type { Sep31Result } from "@/features/sep31-field-readiness-checker/types"

export function ReadinessSummary({ result }: { result: Sep31Result }) {
  return (
    <section aria-label="Readiness">
      <DataList
        items={[
          { label: "Anchor", value: result.anchorId, mono: true },
          { label: "Asset", value: result.assetCode, mono: true },
          { label: "Context", value: result.context },
          { label: "Readiness", value: formatReadiness(result.readiness) }
        ]}
      />
    </section>
  )
}
