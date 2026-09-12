import { describe, expect, it } from "vitest";
import {
  formatLag,
  formatLedgerNumber,
  formatLedgerRange,
  formatRateLimitReset,
  formatTimestamp
} from "@/features/horizon-health/lib/format";

describe("formatLedgerNumber", () => {
  it("formats integer ledger sequences with thousands separators", () => {
    expect(formatLedgerNumber(4634661)).toBe("4,634,661");
    expect(formatLedgerNumber("56000000")).toBe("56,000,000");
    expect(formatLedgerNumber(128)).toBe("128");
  });
});

describe("formatLedgerRange", () => {
  it("formats elder and latest ledgers into an en-dash range", () => {
    expect(formatLedgerRange(128, 4634661)).toBe("128 – 4,634,661");
    expect(formatLedgerRange("1", "56000000")).toBe("1 – 56,000,000");
  });
});

describe("formatLag", () => {
  it("reports zero lag as in sync", () => {
    expect(formatLag(0)).toBe("0 ledgers (in sync)");
    expect(formatLag(-1)).toBe("0 ledgers (in sync)");
  });

  it("reports singular ledger behind for lag of 1", () => {
    expect(formatLag(1)).toBe("1 ledger behind");
  });

  it("reports plural ledgers behind for lag greater than 1", () => {
    expect(formatLag(5)).toBe("5 ledgers behind");
  });
});

describe("formatRateLimitReset", () => {
  it("returns an em-dash when reset header is absent", () => {
    expect(formatRateLimitReset(null)).toBe("—");
  });

  it("formats delta seconds cleanly", () => {
    expect(formatRateLimitReset("60")).toBe("60s");
  });

  it("formats unix epoch timestamps into UTC time strings", () => {
    const formatted = formatRateLimitReset("1726123456");
    expect(formatted).toContain("UTC");
  });

  it("falls back to raw text for non-numeric input", () => {
    expect(formatRateLimitReset("unparseable")).toBe("unparseable");
  });
});

describe("formatTimestamp", () => {
  it("formats valid ISO strings into UTC text", () => {
    expect(formatTimestamp("2026-09-12T07:08:12Z")).toBe("2026-09-12 07:08:12 UTC");
  });

  it("returns invalid date inputs unmodified", () => {
    expect(formatTimestamp("not-a-date")).toBe("not-a-date");
  });
});
