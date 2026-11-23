import { Keypair } from "@stellar/stellar-sdk"
import { describe, expect, it } from "vitest"
import { duplicatePairs, nativePair } from "@/features/cross-network-asset-parity-report/fixtures/boundary.fixture"
import { leftIssuer, pairsJson, rightIssuer } from "@/features/cross-network-asset-parity-report/fixtures/normal.fixture"
import { MAX_PAIRS, parseParityInput } from "@/features/cross-network-asset-parity-report/schema"

describe("parseParityInput", () => {
  it("rejects an empty list", () => {
    expect(parseParityInput({ pairsJson: "[]" })).toEqual({ ok: false, code: "empty_input" })
  })

  it("rejects a secret seed and does not return it", () => {
    const secret = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 8)).secret()
    const result = parseParityInput({ pairsJson: secret })
    expect(result).toEqual({ ok: false, code: "invalid_input" })
    expect(JSON.stringify(result)).not.toContain(secret)
  })

  it("rejects native XLM, duplicate definitions, and more than 10 pairs", () => {
    expect(parseParityInput({ pairsJson: nativePair })).toEqual({ ok: false, code: "unsupported_variant" })
    expect(parseParityInput({ pairsJson: duplicatePairs })).toEqual({ ok: false, code: "invalid_input" })
    const many = Array.from({ length: MAX_PAIRS + 1 }, (_, index) => ({
      id: `pair-${index}`,
      left: { network: "testnet", code: "USDC", issuer: leftIssuer },
      right: { network: "mainnet", code: `A${index}`, issuer: rightIssuer }
    }))
    expect(parseParityInput({ pairsJson: JSON.stringify(many) })).toEqual({ ok: false, code: "too_large" })
  })

  it("accepts an explicit pair", () => {
    const result = parseParityInput({ pairsJson: pairsJson() })
    expect(result.ok && result.value.pairs).toHaveLength(1)
  })

  it("rejects malformed JSON", () => {
    expect(parseParityInput({ pairsJson: "{" })).toEqual({ ok: false, code: "malformed_data" })
  })
})
