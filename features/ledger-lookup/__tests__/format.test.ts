import { describe, expect, it } from "vitest";
import {
  formatAmount,
  formatInteger,
  formatRelativeAge,
  formatStroops,
  formatTimestamp,
  stroopsToXlm
} from "@/features/ledger-lookup/lib/format";

describe("formatAmount", () => {
  it("formats integer amounts with thousands separators", () => {
    expect(formatAmount("105000000000")).toBe("105,000,000,000");
  });

  it("trims trailing zeros from decimal fractions", () => {
    expect(formatAmount("105000000000.0000000")).toBe("105,000,000,000");
    expect(formatAmount("12345.6789000")).toBe("12,345.6789");
    expect(formatAmount("0.5000000")).toBe("0.5");
  });

  it("handles zero values", () => {
    expect(formatAmount("0.0000000")).toBe("0");
  });
});

describe("stroopsToXlm", () => {
  it("converts stroops to XLM amounts using BigInt division", () => {
    expect(stroopsToXlm(100)).toBe("0.00001");
    expect(stroopsToXlm(5_000_000)).toBe("0.5");
    expect(stroopsToXlm(10_000_000)).toBe("1");
    expect(stroopsToXlm(25_000_000)).toBe("2.5");
  });
});

describe("formatStroops", () => {
  it("formats stroop amounts with thousands separator and XLM equivalent", () => {
    expect(formatStroops(100)).toBe("100 stroops (0.00001 XLM)");
    expect(formatStroops(5_000_000)).toBe("5,000,000 stroops (0.5 XLM)");
  });
});

describe("formatTimestamp", () => {
  it("formats ISO timestamps in UTC", () => {
    expect(formatTimestamp("2026-08-20T10:15:00.000Z")).toBe("2026-08-20 10:15:00 UTC");
  });

  it("returns raw string if timestamp is invalid", () => {
    expect(formatTimestamp("invalid-date")).toBe("invalid-date");
  });
});

describe("formatRelativeAge", () => {
  const baseTime = new Date("2026-08-20T10:15:00.000Z").getTime();

  it("handles durations under 5 seconds as just now", () => {
    expect(formatRelativeAge("2026-08-20T10:14:58.000Z", baseTime)).toBe("just now");
  });

  it("handles seconds", () => {
    expect(formatRelativeAge("2026-08-20T10:14:30.000Z", baseTime)).toBe("30 seconds ago");
  });

  it("handles single and multiple minutes", () => {
    expect(formatRelativeAge("2026-08-20T10:14:00.000Z", baseTime)).toBe("1 minute ago");
    expect(formatRelativeAge("2026-08-20T10:05:00.000Z", baseTime)).toBe("10 minutes ago");
  });

  it("handles single and multiple hours", () => {
    expect(formatRelativeAge("2026-08-20T09:15:00.000Z", baseTime)).toBe("1 hour ago");
    expect(formatRelativeAge("2026-08-20T05:15:00.000Z", baseTime)).toBe("5 hours ago");
  });

  it("handles single and multiple days", () => {
    expect(formatRelativeAge("2026-08-19T10:15:00.000Z", baseTime)).toBe("1 day ago");
    expect(formatRelativeAge("2026-08-15T10:15:00.000Z", baseTime)).toBe("5 days ago");
  });

  it("handles months and years", () => {
    expect(formatRelativeAge("2026-07-20T10:15:00.000Z", baseTime)).toBe("1 month ago");
    expect(formatRelativeAge("2025-08-20T10:15:00.000Z", baseTime)).toBe("1 year ago");
  });

  it("handles invalid dates", () => {
    expect(formatRelativeAge("not-a-date", baseTime)).toBe("Unknown");
  });
});

describe("formatInteger", () => {
  it("formats numbers with commas", () => {
    expect(formatInteger(50000000)).toBe("50,000,000");
  });
});
