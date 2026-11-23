export type Sep6ErrorCode =
  | "empty_input"
  | "invalid_input"
  | "malformed_data"
  | "unsupported_variant"
  | "too_large"

export type CapabilityDirection = "deposit" | "withdraw" | "deposit-exchange" | "withdraw-exchange"

export type AmountRange = "comparable" | "incompatible" | "absent"

export type FeeModel = "absent" | "fixed" | "percent" | "both"

export interface Sep6Input {
  anchorUrl: string
  infoJson: string
}

export interface CapabilityRecord {
  asset: string
  direction: CapabilityDirection
  enabled: boolean | null
  authenticationRequired: boolean | null
  minAmount: string | null
  maxAmount: string | null
  feeFixed: string | null
  feePercent: string | null
  amountRange: AmountRange
  feeModel: FeeModel
  unsupportedFields: string[]
  malformed: boolean
}

export interface Sep6Result {
  anchorUrl: string
  records: CapabilityRecord[]
  directions: CapabilityDirection[]
  completeness: "complete" | "incomplete"
}
