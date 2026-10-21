import { describe, expect, it } from "vitest";
import { projectSpendableBalance } from "@/features/reserve-capacity-planner/lib/spendable-projection";

describe("spendable projection", () => {
  it("subtracts the minimum from a larger starting balance", () => {
    // 100_000_000 − 60_000_000 = 40_000_000 stroops.
    expect(projectSpendableBalance(60_000_000n, 100_000_000n)).toEqual({
      spendableStroops: 40_000_000n,
      belowMinimum: false,
      shortfallStroops: 0n
    });
  });

  it("returns zero spendable and the shortfall when the start is below the minimum", () => {
    // Minimum 10_000_000, start 5_000_000, shortfall 5_000_000.
    expect(projectSpendableBalance(10_000_000n, 5_000_000n)).toEqual({
      spendableStroops: 0n,
      belowMinimum: true,
      shortfallStroops: 5_000_000n
    });
  });

  it("treats an equal starting balance as fully reserved", () => {
    const projection = projectSpendableBalance(10_000_000n, 10_000_000n);
    expect(projection.spendableStroops).toBe(0n);
    expect(projection.belowMinimum).toBe(false);
  });

  it("leaves spendable unset when no starting balance was given", () => {
    expect(projectSpendableBalance(10_000_000n, null)).toEqual({
      spendableStroops: null,
      belowMinimum: false,
      shortfallStroops: null
    });
  });
});
