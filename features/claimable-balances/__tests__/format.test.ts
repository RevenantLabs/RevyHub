import { describe, expect, it } from "vitest";
import {
  formatAmount,
  formatBalanceHeading,
  formatClaimantStatus,
  formatTimestamp
} from "@/features/claimable-balances/lib/format";
import { claimableBalancesFixture } from "@/features/claimable-balances/fixtures/claimableBalances.fixture";

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
    const balance = claimableBalancesFixture.balances[0];
    expect(formatBalanceHeading(balance)).toBe(`125.5 ${balance.asset.label}`);
  });
});

describe("formatClaimantStatus", () => {
  it("labels the current claimability", () => {
    expect(formatClaimantStatus(true)).toBe("Claimable now");
    expect(formatClaimantStatus(false)).toBe("Not claimable now");
  });
});
