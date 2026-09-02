import { describe, expect, it } from "vitest";
import {
  formatClosedAt,
  formatEventType,
  formatLedgerRange
} from "@/features/contract-events/lib/format";

describe("formatEventType", () => {
  it("capitalises event types", () => {
    expect(formatEventType("contract")).toBe("Contract");
    expect(formatEventType("system")).toBe("System");
    expect(formatEventType("diagnostic")).toBe("Diagnostic");
  });
});

describe("formatLedgerRange", () => {
  it("formats a ledger range with thousands separators", () => {
    expect(formatLedgerRange(1000, 2000)).toBe("1,000 - 2,000");
  });
});

describe("formatClosedAt", () => {
  it("formats an ISO timestamp", () => {
    const formatted = formatClosedAt("2026-09-01T12:00:00.000Z");
    expect(typeof formatted).toBe("string");
    expect(formatted).toContain("2026");
  });

  it("returns null for a missing timestamp", () => {
    expect(formatClosedAt(null)).toBeNull();
  });
});

