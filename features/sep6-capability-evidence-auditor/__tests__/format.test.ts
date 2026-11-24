import { describe, expect, it } from "vitest"
import { formatAmount, formatFlag, formatRecordTitle } from "@/features/sep6-capability-evidence-auditor/lib/format"

describe("SEP-6 formatting", () => {
  it("does not replace a missing flag or amount with a default", () => {
    expect(formatFlag(null)).toBe("not declared")
    expect(formatFlag(false)).toBe("false")
    expect(formatAmount(null)).toBe("not declared")
    expect(formatAmount("0.10")).toBe("0.10")
  })

  it("keeps the asset code in the section title", () => {
    expect(
      formatRecordTitle({
        asset: "USD",
        direction: "deposit",
        enabled: null,
        authenticationRequired: null,
        minAmount: null,
        maxAmount: null,
        feeFixed: null,
        feePercent: null,
        amountRange: "absent",
        feeModel: "absent",
        unsupportedFields: [],
        malformed: false
      })
    ).toBe("deposit / USD")
  })
})
