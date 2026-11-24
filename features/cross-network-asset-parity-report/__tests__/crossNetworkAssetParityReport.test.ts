import { describe, expect, it } from "vitest"
import {
  accountBody,
  assetBody,
  downIssuer,
  leftIssuer,
  missingIssuer,
  RETRIEVED_AT,
  rightIssuer
} from "@/features/cross-network-asset-parity-report/fixtures/normal.fixture"
import { runCrossNetworkAssetParityReport } from "@/features/cross-network-asset-parity-report/lib/crossNetworkAssetParityReport"

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })
}

function fetchFor(mode: "ok" | "limited" | "down"): typeof fetch {
  return async (input) => {
    const url = String(input)
    if (mode === "limited") return json({}, 429)
    if (url.includes(`/accounts/${downIssuer}`)) return json({}, 500)
    if (url.includes(`/accounts/${missingIssuer}`)) return json({}, 404)
    if (url.includes(`/accounts/${leftIssuer}`)) return json(accountBody("left.example", true))
    if (url.includes(`/accounts/${rightIssuer}`)) return json(accountBody("right.example", false))
    if (url.includes("/assets")) {
      const issuer = new URL(url).searchParams.get("asset_issuer") ?? leftIssuer
      return json(assetBody("USDC", issuer))
    }
    return json({}, 500)
  }
}

const now = () => RETRIEVED_AT

describe("runCrossNetworkAssetParityReport", () => {
  it("compares two issued assets without a price field", async () => {
    const result = await runCrossNetworkAssetParityReport(
      {
        pairs: [
          {
            id: "pair-usdc",
            left: { network: "testnet", code: "USDC", issuer: leftIssuer },
            right: { network: "mainnet", code: "USDC", issuer: rightIssuer }
          }
        ]
      },
      { fetchImpl: fetchFor("ok"), now }
    )
    expect(result.ok && result.value.pairs[0]?.diffs.find((diff) => diff.field === "home_domain")?.status).toBe("different")
    expect(JSON.stringify(result)).not.toContain("price")
    expect(result.ok && result.value.provider).toBe("horizon")
  })

  it("keeps one missing side inside a partial report", async () => {
    const result = await runCrossNetworkAssetParityReport(
      {
        pairs: [
          {
            id: "pair-missing",
            left: { network: "testnet", code: "USDC", issuer: leftIssuer },
            right: { network: "mainnet", code: "USDC", issuer: missingIssuer }
          }
        ]
      },
      { fetchImpl: fetchFor("ok"), now }
    )
    expect(result.ok && result.value.partial).toBe(true)
    expect(result.ok && result.value.pairs[0]?.right.status).toBe("missing")
  })

  it("returns rate_limited only when every side is limited", async () => {
    const result = await runCrossNetworkAssetParityReport(
      {
        pairs: [
          {
            id: "pair-usdc",
            left: { network: "testnet", code: "USDC", issuer: leftIssuer },
            right: { network: "mainnet", code: "USDC", issuer: rightIssuer }
          }
        ]
      },
      { fetchImpl: fetchFor("limited"), now }
    )
    expect(result).toEqual({ ok: false, code: "rate_limited" })
  })

  it("keeps a failed network as a partial row when the other side loaded", async () => {
    const result = await runCrossNetworkAssetParityReport(
      {
        pairs: [
          {
            id: "pair-down",
            left: { network: "testnet", code: "USDC", issuer: leftIssuer },
            right: { network: "mainnet", code: "USDC", issuer: downIssuer }
          }
        ]
      },
      { fetchImpl: fetchFor("down"), now }
    )
    expect(result.ok && result.value.pairs[0]?.right.failure).toBe("request_failed")
    expect(result.ok && result.value.partial).toBe(true)
  })
})
