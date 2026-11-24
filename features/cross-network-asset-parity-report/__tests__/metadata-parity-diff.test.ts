import { describe, expect, it } from "vitest"
import type { SideEvidence } from "@/features/cross-network-asset-parity-report/types"
import { diffSideEvidence } from "@/features/cross-network-asset-parity-report/lib/metadata-parity-diff"
import { leftIssuer, RETRIEVED_AT, rightIssuer } from "@/features/cross-network-asset-parity-report/fixtures/normal.fixture"

function side(overrides: Partial<SideEvidence>): SideEvidence {
  return {
    network: "testnet",
    code: "USDC",
    issuer: leftIssuer,
    status: "found",
    authRequired: true,
    authRevocable: false,
    authImmutable: false,
    authClawbackEnabled: false,
    homeDomain: "left.example",
    assetType: "credit_alphanum4",
    ledger: "1",
    retrievedAt: RETRIEVED_AT,
    provider: "horizon",
    failure: null,
    ...overrides
  }
}

describe("diffSideEvidence", () => {
  it("reports a reused code under two issuers and contradictory home domains", () => {
    const diffs = diffSideEvidence(
      side({}),
      side({ issuer: rightIssuer, homeDomain: "right.example", network: "mainnet", authRequired: false })
    )
    expect(diffs.find((diff) => diff.field === "code")?.status).toBe("same")
    expect(diffs.find((diff) => diff.field === "issuer")?.status).toBe("different")
    expect(diffs.find((diff) => diff.field === "home_domain")?.status).toBe("different")
    expect(diffs.find((diff) => diff.field === "auth_required")?.status).toBe("different")
  })

  it("leaves retrieved fields unavailable when one network did not answer", () => {
    const diffs = diffSideEvidence(side({}), side({ status: "unavailable", homeDomain: null, failure: "request_failed" }))
    expect(diffs.find((diff) => diff.field === "home_domain")?.status).toBe("unavailable")
    expect(diffs.find((diff) => diff.field === "code")?.status).toBe("same")
  })
})
