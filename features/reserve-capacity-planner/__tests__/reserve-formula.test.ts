import { describe, expect, it } from "vitest";
import {
  accountReserveStroops,
  isNegativeXlmAmount,
  minimumBalanceStroops,
  parseNonNegativeXlm,
  subentryReserveStroops,
  xlmToStroops
} from "@/features/reserve-capacity-planner/lib/reserve-formula";

describe("reserve formula", () => {
  it("uses the classic two-plus-subentries product in stroops", () => {
    // Hand-computed: 5_000_000 × (2 + 10) = 60_000_000.
    expect(minimumBalanceStroops(5_000_000n, 10n)).toBe(60_000_000n);
    // 5_000_000 × (2 + 0) = 10_000_000.
    expect(minimumBalanceStroops(5_000_000n, 0n)).toBe(10_000_000n);
    // 12_500_000 × (2 + 10) = 150_000_000.
    expect(minimumBalanceStroops(12_500_000n, 10n)).toBe(150_000_000n);
    // One stroop of base reserve and one subentry: 1 × 3 = 3.
    expect(minimumBalanceStroops(1n, 1n)).toBe(3n);
  });

  it("splits the minimum into the account reserve and the subentry reserve", () => {
    const base = 5_000_000n;
    expect(accountReserveStroops(base)).toBe(10_000_000n);
    expect(subentryReserveStroops(base, 10n)).toBe(50_000_000n);
    expect(accountReserveStroops(base) + subentryReserveStroops(base, 10n)).toBe(minimumBalanceStroops(base, 10n));
  });

  it("parses XLM amounts as exact stroops", () => {
    expect(xlmToStroops("0.5")).toBe(5_000_000n);
    expect(xlmToStroops("1.25")).toBe(12_500_000n);
    expect(xlmToStroops("0.0000001")).toBe(1n);
    expect(parseNonNegativeXlm("10")).toBe(100_000_000n);
    expect(parseNonNegativeXlm("0.00000001")).toBeNull();
    expect(parseNonNegativeXlm("-1")).toBeNull();
    expect(isNegativeXlmAmount("-0.5")).toBe(true);
    expect(isNegativeXlmAmount("0.5")).toBe(false);
  });
});
