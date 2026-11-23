import { describe, expect, it } from "vitest"
import { amountRange, compareDecimals } from "@/features/sep6-capability-evidence-auditor/lib/amount-units"

describe("amount units", () => {
  it("compares exact decimals without using floats", () => {
    expect(compareDecimals("1.10", "1.2")).toBe(-1)
    expect(compareDecimals("10.0000000", "10")).toBe(0)
    expect(compareDecimals("2", "1.9999999")).toBe(1)
  })

  it("rejects a range when min is above max or an amount is not decimal", () => {
    expect(amountRange("10", "1")).toBe("incompatible")
    expect(amountRange("1e2", "3")).toBe("incompatible")
    expect(amountRange("1", null)).toBe("absent")
    expect(amountRange("1.00", "1000.00")).toBe("comparable")
  })
})
