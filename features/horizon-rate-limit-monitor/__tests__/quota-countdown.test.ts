import { describe, expect, it } from "vitest";
import { quotaCountdown } from "@/features/horizon-rate-limit-monitor/lib/quota-countdown";
describe("reset countdown", () => {
  it("formats hours, minutes and seconds from Unix seconds", () => {
    expect(quotaCountdown("2000000000", 1999996339000)).toBe("1h 1m 1s");
    expect(quotaCountdown("2000000000", 2000000001000)).toBe("0h 0m 0s");
  });
  it("rejects unavailable and unsafe reset values", () => {
    expect(quotaCountdown(null, 0)).toBeNull();
    expect(quotaCountdown("not-a-time", 0)).toBeNull();
    expect(quotaCountdown("999999999999999999", 0)).toBeNull();
  });
});
