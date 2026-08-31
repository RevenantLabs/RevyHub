import { describe, expect, it } from "vitest";
import { formatShortfall, formatSummary, formatThreshold } from "@/features/multisig-analyzer/lib/format";

describe("formatSummary", () => {
  it("renders a plain-language summary for the result", () => {
    expect(
      formatSummary({
        sourceAccount: "GBB",
        transactionSourceAccount: "GBB",
        requiredThreshold: "medium",
        requiredWeight: "5",
        signatureWeight: "3",
        availableWeight: "3",
        shortfallWeight: "2",
        missingSigners: [{ key: "GZZ", weight: "2", type: "ed25519_public_key" }],
        unattributedSignatures: ["b6f1cf42"],
        operations: []
      })
    ).toContain("2");
  });

  it("formats threshold names consistently", () => {
    expect(formatThreshold("medium")).toBe("Medium");
    expect(formatShortfall("0")).toBe("0");
  });
});
