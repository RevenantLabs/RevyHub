import { describe, expect, it } from "vitest"
import {
  authRequired,
  disabledAsset,
  incompatibleRange,
  malformedRecord,
  missingFee,
  unknownField
} from "@/features/sep6-capability-evidence-auditor/fixtures/boundary.fixture"
import { infoRecord } from "@/features/sep6-capability-evidence-auditor/fixtures/normal.fixture"
import { readCapabilitySections } from "@/features/sep6-capability-evidence-auditor/lib/capability-sections"

describe("readCapabilitySections", () => {
  it("keeps deposit and withdraw sections separate", () => {
    const records = readCapabilitySections(infoRecord)
    expect(records.map((record) => record.direction)).toEqual(["deposit", "withdraw"])
    expect(records[0]?.enabled).toBe(true)
    expect(records[1]?.enabled).toBe(false)
  })

  it("does not turn a missing flag into false", () => {
    const [record] = readCapabilitySections(disabledAsset)
    expect(record?.enabled).toBe(false)
    expect(record?.authenticationRequired).toBeNull()
    expect(record?.feeModel).toBe("absent")
  })

  it("marks a missing fee model and an incompatible range", () => {
    expect(readCapabilitySections(missingFee)[0]?.feeModel).toBe("absent")
    expect(readCapabilitySections(incompatibleRange)[0]?.amountRange).toBe("incompatible")
  })

  it("retains unknown fields and flags a malformed record", () => {
    expect(readCapabilitySections(unknownField)[0]?.unsupportedFields).toEqual(["extra_desk"])
    expect(readCapabilitySections(malformedRecord)[0]?.malformed).toBe(true)
  })

  it("keeps an explicit authentication requirement", () => {
    expect(readCapabilitySections(authRequired)[0]?.authenticationRequired).toBe(true)
  })
})
