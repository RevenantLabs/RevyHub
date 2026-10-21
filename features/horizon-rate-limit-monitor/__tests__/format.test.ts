import { describe, expect, it } from "vitest";
import { copy, errorCopy } from "@/features/horizon-rate-limit-monitor/copy";
import { formatHeader, formatReporting, formatCheckedAt } from "@/features/horizon-rate-limit-monitor/lib/format";
describe("display formatting", () => {
  it("does not turn missing counts into zero", () => {
    expect(formatHeader(null)).toBe(copy.unavailable);
    expect(formatHeader("0")).toBe("0");
    expect(formatReporting("partial")).toBe(copy.partial);
    expect(formatReporting("not_reported")).toBe(copy.notReported);
  });
  it("formats the check timestamp for the local viewer", () => {
    expect(formatCheckedAt(0)).toBe(new Date(0).toLocaleString());
  });
  it("gives each required failure a distinct recovery action", () => {
    const codes = ["invalid_account", "missing_headers", "rate_limited", "request_failed"] as const;
    expect(new Set(codes.map((code) => errorCopy[code].description)).size).toBe(codes.length);
    for (const code of codes) expect(errorCopy[code].description.length).toBeGreaterThan(20);
  });
});
