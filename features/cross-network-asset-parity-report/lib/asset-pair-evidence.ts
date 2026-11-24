import { horizonUrl } from "@/core/horizon/client"
import type { AssetSideInput, SideEvidence } from "@/features/cross-network-asset-parity-report/types"

export interface EvidenceDeps {
  fetchImpl?: typeof fetch
  now?: () => string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function flag(flags: Record<string, unknown> | undefined, key: string): boolean | null {
  if (!flags || !Object.prototype.hasOwnProperty.call(flags, key)) return null
  const value = flags[key]
  return typeof value === "boolean" ? value : null
}

function blank(side: AssetSideInput, retrievedAt: string, status: SideEvidence["status"], failure: SideEvidence["failure"]): SideEvidence {
  return {
    network: side.network,
    code: side.code,
    issuer: side.issuer,
    status,
    authRequired: null,
    authRevocable: null,
    authImmutable: null,
    authClawbackEnabled: null,
    homeDomain: null,
    assetType: null,
    ledger: null,
    retrievedAt,
    provider: "horizon",
    failure
  }
}

async function readBody(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function loadSideEvidence(
  side: AssetSideInput,
  deps: EvidenceDeps = {},
  signal?: AbortSignal
): Promise<SideEvidence> {
  const fetchImpl = deps.fetchImpl ?? globalThis.fetch
  const retrievedAt = (deps.now ?? (() => new Date().toISOString()))()
  const accountUrl = horizonUrl(side.network, `accounts/${side.issuer}`)

  let accountResponse: Response
  try {
    accountResponse = await fetchImpl(accountUrl, { signal, headers: { Accept: "application/json" } })
  } catch {
    return blank(side, retrievedAt, "unavailable", "request_failed")
  }
  if (accountResponse.status === 404) return blank(side, retrievedAt, "missing", null)
  if (accountResponse.status === 429) return blank(side, retrievedAt, "unavailable", "rate_limited")
  if (!accountResponse.ok) return blank(side, retrievedAt, "unavailable", "request_failed")

  const account = await readBody(accountResponse)
  if (!isRecord(account)) return blank(side, retrievedAt, "unavailable", "request_failed")

  const flags = isRecord(account.flags) ? account.flags : undefined
  const homeDomain = typeof account.home_domain === "string" && account.home_domain.length > 0 ? account.home_domain : null
  const ledger = typeof account.last_modified_ledger === "number" ? String(account.last_modified_ledger) : null

  let assetType: string | null = null
  try {
    const assetUrl = horizonUrl(side.network, "assets", {
      asset_code: side.code,
      asset_issuer: side.issuer
    })
    const assetResponse = await fetchImpl(assetUrl, { signal, headers: { Accept: "application/json" } })
    if (assetResponse.ok) {
      const body = await readBody(assetResponse)
      const records = isRecord(body) && isRecord(body._embedded) && Array.isArray(body._embedded.records)
        ? body._embedded.records
        : []
      const first = records.find(isRecord)
      assetType = first && typeof first.asset_type === "string" ? first.asset_type : null
    }
  } catch {
    assetType = null
  }

  return {
    network: side.network,
    code: side.code,
    issuer: side.issuer,
    status: "found",
    authRequired: flag(flags, "auth_required"),
    authRevocable: flag(flags, "auth_revocable"),
    authImmutable: flag(flags, "auth_immutable"),
    authClawbackEnabled: flag(flags, "auth_clawback_enabled"),
    homeDomain,
    assetType,
    ledger,
    retrievedAt,
    provider: "horizon",
    failure: null
  }
}
