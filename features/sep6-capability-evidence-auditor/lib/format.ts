import type { CapabilityRecord } from "@/features/sep6-capability-evidence-auditor/types"

export function formatFlag(value: boolean | null): string {
  if (value === null) return "not declared"
  return value ? "true" : "false"
}

export function formatAmount(value: string | null): string {
  return value === null ? "not declared" : value
}

export function formatRecordTitle(record: CapabilityRecord): string {
  return `${record.direction} / ${record.asset}`
}
