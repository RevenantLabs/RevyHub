import type { StellarNetwork } from "@/core/network/types"

export type ParityErrorCode =
  | "empty_input"
  | "invalid_input"
  | "malformed_data"
  | "unsupported_variant"
  | "too_large"
  | "not_found"
  | "rate_limited"
  | "request_failed"

export interface AssetSideInput {
  network: StellarNetwork
  code: string
  issuer: string
}

export interface PairInput {
  id: string
  left: AssetSideInput
  right: AssetSideInput
}

export interface ParityInput {
  pairs: PairInput[]
}

export type SideStatus = "found" | "missing" | "unavailable"

export interface SideEvidence {
  network: StellarNetwork
  code: string
  issuer: string
  status: SideStatus
  authRequired: boolean | null
  authRevocable: boolean | null
  authImmutable: boolean | null
  authClawbackEnabled: boolean | null
  homeDomain: string | null
  assetType: string | null
  ledger: string | null
  retrievedAt: string
  provider: "horizon"
  failure: "rate_limited" | "request_failed" | null
}

export type DiffStatus = "same" | "different" | "unavailable"

export interface FieldDiff {
  field: string
  left: string
  right: string
  status: DiffStatus
}

export interface PairReport {
  id: string
  left: SideEvidence
  right: SideEvidence
  diffs: FieldDiff[]
  partial: boolean
}

export interface ParityResult {
  pairs: PairReport[]
  partial: boolean
  retrievedAt: string
  provider: "horizon"
}
