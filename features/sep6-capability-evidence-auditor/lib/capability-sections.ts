import type {
  CapabilityDirection,
  CapabilityRecord,
  FeeModel
} from "@/features/sep6-capability-evidence-auditor/types"
import { amountRange, isDecimalString } from "@/features/sep6-capability-evidence-auditor/lib/amount-units"

export const DIRECTIONS: readonly CapabilityDirection[] = [
  "deposit",
  "withdraw",
  "deposit-exchange",
  "withdraw-exchange"
]

const KNOWN = new Set([
  "enabled",
  "authentication_required",
  "min_amount",
  "max_amount",
  "fee_fixed",
  "fee_percent"
])

function optionalBoolean(value: unknown): boolean | null | "bad" {
  if (value === undefined) return null
  if (typeof value === "boolean") return value
  return "bad"
}

function optionalAmount(value: unknown): string | null | "bad" {
  if (value === undefined) return null
  if (typeof value === "string" && isDecimalString(value)) return value
  return "bad"
}

function feeModel(fixed: string | null, percent: string | null): FeeModel {
  if (fixed && percent) return "both"
  if (fixed) return "fixed"
  if (percent) return "percent"
  return "absent"
}

export function readCapabilitySections(info: Record<string, unknown>): CapabilityRecord[] {
  const records: CapabilityRecord[] = []

  for (const direction of DIRECTIONS) {
    const section = info[direction]
    if (section === undefined) continue
    if (typeof section !== "object" || section === null || Array.isArray(section)) {
      records.push({
        asset: "*",
        direction,
        enabled: null,
        authenticationRequired: null,
        minAmount: null,
        maxAmount: null,
        feeFixed: null,
        feePercent: null,
        amountRange: "absent",
        feeModel: "absent",
        unsupportedFields: [],
        malformed: true
      })
      continue
    }

    for (const [asset, raw] of Object.entries(section as Record<string, unknown>)) {
      if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
        records.push({
          asset,
          direction,
          enabled: null,
          authenticationRequired: null,
          minAmount: null,
          maxAmount: null,
          feeFixed: null,
          feePercent: null,
          amountRange: "absent",
          feeModel: "absent",
          unsupportedFields: [],
          malformed: true
        })
        continue
      }
      const entry = raw as Record<string, unknown>
      const enabled = optionalBoolean(entry.enabled)
      const authenticationRequired = optionalBoolean(entry.authentication_required)
      const minAmount = optionalAmount(entry.min_amount)
      const maxAmount = optionalAmount(entry.max_amount)
      const feeFixed = optionalAmount(entry.fee_fixed)
      const feePercent = optionalAmount(entry.fee_percent)
      const bad =
        enabled === "bad" ||
        authenticationRequired === "bad" ||
        minAmount === "bad" ||
        maxAmount === "bad" ||
        feeFixed === "bad" ||
        feePercent === "bad"
      const min = minAmount === "bad" ? null : minAmount
      const max = maxAmount === "bad" ? null : maxAmount
      const fixed = feeFixed === "bad" ? null : feeFixed
      const percent = feePercent === "bad" ? null : feePercent

      records.push({
        asset,
        direction,
        enabled: enabled === "bad" ? null : enabled,
        authenticationRequired: authenticationRequired === "bad" ? null : authenticationRequired,
        minAmount: min,
        maxAmount: max,
        feeFixed: fixed,
        feePercent: percent,
        amountRange: amountRange(min, max),
        feeModel: feeModel(fixed, percent),
        unsupportedFields: Object.keys(entry).filter((key) => !KNOWN.has(key)).sort(),
        malformed: bad
      })
    }
  }

  return records
}
