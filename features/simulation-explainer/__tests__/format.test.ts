import { describe, expect, it } from "vitest";
import {
  formatCount,
  formatOutcomeKind,
  formatStroopsToXlm,
  totalLedgerEntries
} from "@/features/simulation-explainer/lib/format";
import type { SimulationResourceUsage } from "@/features/simulation-explainer/types";

describe("formatStroopsToXlm", () => {
  it("converts stroops to XLM using 7 decimals", () => {
    expect(formatStroopsToXlm("10000000")).toBe("1");
    expect(formatStroopsToXlm("15000000")).toBe("1.5");
    expect(formatStroopsToXlm("1234567")).toBe("0.1234567");
  });
});

describe("formatCount", () => {
  it("groups thousands", () => {
    expect(formatCount("1234567")).toBe("1,234,567");
    expect(formatCount(42)).toBe("42");
  });
});

describe("formatOutcomeKind", () => {
  it("labels each outcome kind", () => {
    expect(formatOutcomeKind("success")).toMatch(/succeeded/i);
    expect(formatOutcomeKind("failure")).toMatch(/failed/i);
    expect(formatOutcomeKind("restore")).toMatch(/restore/i);
  });
});

describe("totalLedgerEntries", () => {
  it("sums read and write entries", () => {
    const resources: SimulationResourceUsage = {
      cpuInstructions: "1",
      memoryBytes: "2",
      readBytes: "3",
      writeBytes: "4",
      ledgerReadEntries: 2,
      ledgerWriteEntries: 3,
      ledgerEntryReadBytes: "5",
      ledgerEntryWriteBytes: "6"
    };

    expect(totalLedgerEntries(resources)).toBe(5);
  });
});
