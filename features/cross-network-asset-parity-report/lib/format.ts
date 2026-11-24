import type { FieldDiff, SideEvidence } from "@/features/cross-network-asset-parity-report/types"

export function formatSideStatus(side: SideEvidence): string {
  if (side.failure === "rate_limited") return "unavailable (rate limited)"
  if (side.failure === "request_failed") return "unavailable (request failed)"
  return side.status
}

export function formatDiff(diff: FieldDiff): string {
  return `${diff.field}: ${diff.status}`
}

export function formatProvenance(side: SideEvidence): string {
  const ledger = side.ledger ?? "not declared"
  return `${side.network} · ${side.provider} · ledger ${ledger} · ${side.retrievedAt}`
}
