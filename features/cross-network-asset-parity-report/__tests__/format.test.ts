import { describe, expect, it } from "vitest"
import { leftIssuer, RETRIEVED_AT } from "@/features/cross-network-asset-parity-report/fixtures/normal.fixture"
import { formatProvenance, formatSideStatus } from "@/features/cross-network-asset-parity-report/lib/format"
import { toCrossNetworkAssetParityReportErrorCode } from "@/features/cross-network-asset-parity-report/lib/crossNetworkAssetParityReport.errors"
import type { SideEvidence } from "@/features/cross-network-asset-parity-report/types"

const side: SideEvidence = {
  network: "testnet",
  code: "USDC",
  issuer: leftIssuer,
  status: "found",
  authRequired: null,
  authRevocable: null,
  authImmutable: null,
  authClawbackEnabled: null,
  homeDomain: null,
  assetType: null,
  ledger: "99",
  retrievedAt: RETRIEVED_AT,
  provider: "horizon",
  failure: null
}

describe("parity formatting", () => {
  it("names the network, provider, ledger, and retrieval time", () => {
    expect(formatProvenance(side)).toContain("testnet")
    expect(formatProvenance(side)).toContain("horizon")
    expect(formatProvenance(side)).toContain(RETRIEVED_AT)
    expect(formatSideStatus(side)).toBe("found")
  })

  it("maps a Horizon 404 onto not_found", () => {
    expect(toCrossNetworkAssetParityReportErrorCode({ response: { status: 404 } })).toBe("not_found")
  })
})
