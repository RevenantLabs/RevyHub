import { DataList } from "@/core/ui/DataList"
import { formatAmount, formatFlag, formatRecordTitle } from "@/features/sep6-capability-evidence-auditor/lib/format"
import type { CapabilityRecord } from "@/features/sep6-capability-evidence-auditor/types"

export function CapabilityEvidenceList({ record }: { record: CapabilityRecord }) {
  return (
    <section aria-label={formatRecordTitle(record)}>
      <h3 className="mt-4 text-sm font-extrabold text-[#172033]">{formatRecordTitle(record)}</h3>
      <DataList
        items={[
          { label: "Enabled", value: formatFlag(record.enabled) },
          { label: "Authentication required", value: formatFlag(record.authenticationRequired) },
          { label: "Min amount", value: formatAmount(record.minAmount), mono: true },
          { label: "Max amount", value: formatAmount(record.maxAmount), mono: true },
          { label: "Amount range", value: record.amountRange },
          { label: "Fee model", value: record.feeModel },
          { label: "Fee fixed", value: formatAmount(record.feeFixed), mono: true },
          { label: "Fee percent", value: formatAmount(record.feePercent), mono: true },
          { label: "Malformed record", value: record.malformed ? "yes" : "no" },
          {
            label: "Unsupported fields",
            value: record.unsupportedFields.length === 0 ? "none" : record.unsupportedFields.join(", ")
          }
        ]}
      />
    </section>
  )
}
