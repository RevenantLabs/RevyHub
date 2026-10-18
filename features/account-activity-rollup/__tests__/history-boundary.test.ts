import { describe, expect, it } from "vitest";
import { describeHistory } from "@/features/account-activity-rollup/lib/history-boundary";
import { overlappingOperations } from "@/features/account-activity-rollup/fixtures/operations.fixture";

describe("history boundary", () => {
  it("reports only fetched unique records and their UTC day range", () => {
    expect(describeHistory(overlappingOperations, 2, true)).toEqual({ newestDay: "2024-01-16", oldestDay: "2024-01-15", pages: 2, records: 3, hasMore: true });
  });
  it("shows an empty observed window without inventing dates", () => {
    expect(describeHistory([], 1, false)).toEqual({ newestDay: null, oldestDay: null, pages: 1, records: 0, hasMore: false });
  });
});
