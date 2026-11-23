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
import { loadSideEvidence } from "@/features/cross-network-asset-parity-report/lib/asset-pair-evidence"

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })
}

const fetchImpl: typeof fetch = async (input) => {
  const url = String(input)
  if (url.includes(`/accounts/${leftIssuer}`)) return json(accountBody("left.example", true))
  if (url.includes(`/accounts/${missingIssuer}`)) return json({ title: "Resource Missing" }, 404)
  if (url.includes(`/accounts/${downIssuer}`)) return json({ title: "Server Error" }, 500)
  if (url.includes("/assets")) return json(assetBody("USDC", leftIssuer))
  return json({}, 429)
}

const deps = { fetchImpl, now: () => RETRIEVED_AT }

describe("loadSideEvidence", () => {
  it("reads flags, home domain, ledger, and asset type from Horizon", async () => {
    const side = await loadSideEvidence({ network: "testnet", code: "USDC", issuer: leftIssuer }, deps)
    expect(side.status).toBe("found")
    expect(side.authRequired).toBe(true)
    expect(side.homeDomain).toBe("left.example")
    expect(side.assetType).toBe("credit_alphanum4")
    expect(side.ledger).toBe("12345")
    expect(side.provider).toBe("horizon")
    expect(side.retrievedAt).toBe(RETRIEVED_AT)
    expect(side.network).toBe("testnet")
  })

  it("keeps a missing account as a partial side", async () => {
    const side = await loadSideEvidence({ network: "mainnet", code: "USDC", issuer: missingIssuer }, deps)
    expect(side.status).toBe("missing")
    expect(side.homeDomain).toBeNull()
  })

  it("marks a server failure unavailable", async () => {
    const side = await loadSideEvidence({ network: "mainnet", code: "USDC", issuer: downIssuer }, deps)
    expect(side.status).toBe("unavailable")
    expect(side.failure).toBe("request_failed")
  })

  it("marks a rate limit without treating it as a missing asset", async () => {
    const side = await loadSideEvidence({ network: "testnet", code: "USDC", issuer: rightIssuer }, deps)
    expect(side.failure).toBe("rate_limited")
  })
})
