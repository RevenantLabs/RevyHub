import type { DiffStatus, FieldDiff, SideEvidence } from "@/features/cross-network-asset-parity-report/types"

function formatValue(value: string | boolean | null): string {
  if (value === null) return "not declared"
  if (typeof value === "boolean") return value ? "true" : "false"
  return value
}

function compareRetrieved(left: SideEvidence, right: SideEvidence, leftValue: string | boolean | null, rightValue: string | boolean | null, field: string): FieldDiff {
  if (left.status !== "found" || right.status !== "found") {
    return {
      field,
      left: left.status === "found" ? formatValue(leftValue) : left.status,
      right: right.status === "found" ? formatValue(rightValue) : right.status,
      status: "unavailable"
    }
  }
  const leftText = formatValue(leftValue)
  const rightText = formatValue(rightValue)
  return {
    field,
    left: leftText,
    right: rightText,
    status: leftText === rightText ? "same" : "different"
  }
}

export function diffSideEvidence(left: SideEvidence, right: SideEvidence): FieldDiff[] {
  const identity: FieldDiff[] = [
    {
      field: "code",
      left: left.code,
      right: right.code,
      status: (left.code === right.code ? "same" : "different") as DiffStatus
    },
    {
      field: "issuer",
      left: left.issuer,
      right: right.issuer,
      status: left.issuer === right.issuer ? "same" : "different"
    }
  ]

  return [
    ...identity,
    compareRetrieved(left, right, left.homeDomain, right.homeDomain, "home_domain"),
    compareRetrieved(left, right, left.assetType, right.assetType, "asset_type"),
    compareRetrieved(left, right, left.authRequired, right.authRequired, "auth_required"),
    compareRetrieved(left, right, left.authRevocable, right.authRevocable, "auth_revocable"),
    compareRetrieved(left, right, left.authImmutable, right.authImmutable, "auth_immutable"),
    compareRetrieved(left, right, left.authClawbackEnabled, right.authClawbackEnabled, "auth_clawback_enabled")
  ]
}
