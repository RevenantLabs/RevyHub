import { CapabilityEvidenceList } from "@/features/sep6-capability-evidence-auditor/components/CapabilityEvidenceList"
import { copy } from "@/features/sep6-capability-evidence-auditor/copy"
import type { CapabilityDirection, CapabilityRecord } from "@/features/sep6-capability-evidence-auditor/types"

const ORDER: CapabilityDirection[] = ["deposit", "withdraw", "deposit-exchange", "withdraw-exchange"]

export function CapabilitySections({ records }: { records: CapabilityRecord[] }) {
  if (records.length === 0) return <p className="text-sm text-[#4e5c73]">{copy.emptyRecords}</p>
  return (
    <div>
      {ORDER.filter((direction) => records.some((record) => record.direction === direction)).map((direction) => (
        <div key={direction}>
          {records
            .filter((record) => record.direction === direction)
            .map((record) => (
              <CapabilityEvidenceList key={`${record.direction}:${record.asset}`} record={record} />
            ))}
        </div>
      ))}
    </div>
  )
}
