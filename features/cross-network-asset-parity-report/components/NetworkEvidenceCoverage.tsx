import { DataList } from "@/core/ui/DataList"
import { formatProvenance, formatSideStatus } from "@/features/cross-network-asset-parity-report/lib/format"
import type { SideEvidence } from "@/features/cross-network-asset-parity-report/types"

export function NetworkEvidenceCoverage({ label, side }: { label: string; side: SideEvidence }) {
  return (
    <section aria-label={`${label} evidence`}>
      <h3 className="mt-4 text-sm font-extrabold text-[#172033]">{label}</h3>
      <DataList
        items={[
          { label: "Status", value: formatSideStatus(side) },
          { label: "Network", value: side.network },
          { label: "Provider", value: side.provider },
          { label: "Ledger", value: side.ledger ?? "not declared", mono: true },
          { label: "Retrieved", value: side.retrievedAt, mono: true },
          { label: "Provenance", value: formatProvenance(side) }
        ]}
      />
    </section>
  )
}
