import { describe, expect, it } from "vitest";
import { hasNonZeroLiabilities, allLiabilitiesZero, type DisplayBalance } from "@/components/stellar/BalanceList";

function makeBalance(overrides: Partial<DisplayBalance> = {}): DisplayBalance {
  return {
    assetCode: "XLM",
    amount: "100.0000000",
    ...overrides,
  };
}

describe("hasNonZeroLiabilities", () => {
  it("returns true when buying liabilities are non-zero", () => {
    const balance = makeBalance({ buyingLiabilities: "5.0000000" });
    expect(hasNonZeroLiabilities(balance)).toBe(true);
  });

  it("returns true when selling liabilities are non-zero", () => {
    const balance = makeBalance({ sellingLiabilities: "3.0000000" });
    expect(hasNonZeroLiabilities(balance)).toBe(true);
  });

  it("returns false when both liabilities are undefined", () => {
    expect(hasNonZeroLiabilities(makeBalance())).toBe(false);
  });

  it("returns false when both liabilities are zero", () => {
    const balance = makeBalance({
      buyingLiabilities: "0.0000000",
      sellingLiabilities: "0.0000000",
    });
    expect(hasNonZeroLiabilities(balance)).toBe(false);
  });

  it("returns true when both liabilities are non-zero", () => {
    const balance = makeBalance({
      buyingLiabilities: "5.0000000",
      sellingLiabilities: "3.0000000",
    });
    expect(hasNonZeroLiabilities(balance)).toBe(true);
  });
});

describe("allLiabilitiesZero", () => {
  it("returns true when both are zero", () => {
    const balance = makeBalance({
      buyingLiabilities: "0.0000000",
      sellingLiabilities: "0.0000000",
    });
    expect(allLiabilitiesZero(balance)).toBe(true);
  });

  it("returns true when both are undefined", () => {
    expect(allLiabilitiesZero(makeBalance())).toBe(true);
  });

  it("returns false when buying is non-zero", () => {
    const balance = makeBalance({ buyingLiabilities: "5.0000000" });
    expect(allLiabilitiesZero(balance)).toBe(false);
  });

  it("returns false when selling is non-zero", () => {
    const balance = makeBalance({ sellingLiabilities: "3.0000000" });
    expect(allLiabilitiesZero(balance)).toBe(false);
  });
});
