import { describe, expect, it } from "vitest";
import { isLowQuota } from "@/features/horizon-rate-limit-monitor/lib/low-quota-flag";
describe("low quota flag", () => {
  it("flags only reported counts strictly below the threshold", () => {
    expect(isLowQuota("9", 10)).toBe(true);
    expect(isLowQuota("10", 10)).toBe(false);
    expect(isLowQuota("0", 0)).toBe(false);
    expect(isLowQuota(null, 10)).toBe(false);
    expect(isLowQuota("999999999999999999", 10)).toBe(false);
  });
});
