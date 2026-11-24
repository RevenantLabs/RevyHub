import { describe, expect, it } from "vitest"
import { formatChoices, formatReadiness } from "@/features/sep31-field-readiness-checker/lib/format"

describe("SEP-31 formatting", () => {
  it("describes readiness without inventing a provider decision", () => {
    expect(formatReadiness("empty")).toContain("Empty")
    expect(formatReadiness("ready")).toContain("Ready")
  })

  it("lists declared choices and leaves missing ones undeclared", () => {
    expect(formatChoices({
      name: "bank_country",
      description: null,
      optional: false,
      choices: ["US", "DE"],
      status: "present",
      reason: "Supplied. The value is not shown."
    })).toBe("US, DE")
    expect(formatChoices({
      name: "email_address",
      description: null,
      optional: false,
      choices: null,
      status: "missing",
      reason: "Required field was not supplied."
    })).toBe("not declared")
  })
})
