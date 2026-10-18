import { describe, expect, it } from "vitest";
import { copy } from "@/features/account-activity-rollup/copy";
import { formatCoverage, formatDayRange, formatOperationType } from "@/features/account-activity-rollup/lib/format";
import { describeHistory } from "@/features/account-activity-rollup/lib/history-boundary";
import { overlappingOperations } from "@/features/account-activity-rollup/fixtures/operations.fixture";

describe("display formatting", () => {
  it("labels operation types without changing data keys", () => expect(formatOperationType("manage_sell_offer")).toBe("manage sell offer"));
  it("includes explicit record and page counts", () => {
    const coverage = describeHistory(overlappingOperations, 2, true);
    expect(formatCoverage(coverage)).toBe(`${copy.coveragePrefix} 3 ${copy.coverageSuffix} 2 ${copy.coveragePages}.`);
    expect(formatDayRange(coverage)).toBe("2024-01-15 – 2024-01-16");
  });
  it("does not invent an empty day range", () => expect(formatDayRange(describeHistory([], 1, false))).toBeNull());
});
