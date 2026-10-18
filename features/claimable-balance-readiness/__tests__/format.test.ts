import { describe, expect, it } from "vitest";
import {
  formatAmount,
  formatBalanceHeading,
  formatBranchOutcome,
  formatCreationContext,
  formatTimestamp,
  formatVerdict
} from "@/features/claimable-balance-readiness/lib/format";
import { claimableBalanceReadinessFixture } from "@/features/claimable-balance-readiness/fixtures/claimableBalanceReadiness.fixture";
import { copy } from "@/features/claimable-balance-readiness/copy";

describe("formatAmount", () => {
  it("formats Stellar amounts without floats", () => {
    expect(formatAmount("125.5000000")).toBe("125.5");
  });
});

describe("formatTimestamp", () => {
  it("renders ISO timestamps in UTC", () => {
    expect(formatTimestamp("2026-05-02T10:14:05Z")).toBe("2026-05-02 10:14:05 UTC");
  });
});

describe("formatBalanceHeading", () => {
  it("combines the amount and asset label", () => {
    expect(formatBalanceHeading(claimableBalanceReadinessFixture)).toBe(
      `125.5 ${claimableBalanceReadinessFixture.asset.label}`
    );
  });
});

describe("formatVerdict", () => {
  it("labels each readiness verdict", () => {
    expect(formatVerdict("eligible")).toBe(copy.verdictEligible);
    expect(formatVerdict("ineligible")).toBe(copy.verdictIneligible);
    expect(formatVerdict("indeterminate")).toBe(copy.verdictIndeterminate);
    expect(formatVerdict("not_listed")).toBe(copy.verdictNotListed);
  });
});

describe("formatBranchOutcome", () => {
  it("labels each branch outcome", () => {
    expect(formatBranchOutcome("satisfied")).toBe(copy.branchSatisfied);
    expect(formatBranchOutcome("unsatisfied")).toBe(copy.branchUnsatisfied);
    expect(formatBranchOutcome("indeterminate")).toBe(copy.branchIndeterminate);
  });
});

describe("formatCreationContext", () => {
  it("shows unavailable when creation is unreliable", () => {
    expect(formatCreationContext(null, false)).toBe("Unavailable");
  });

  it("formats a reliable creation timestamp", () => {
    expect(formatCreationContext("2026-05-02T10:14:05Z", true)).toBe(
      "2026-05-02 10:14:05 UTC"
    );
  });
});
