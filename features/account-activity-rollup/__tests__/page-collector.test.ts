import { describe, expect, it } from "vitest";
import { collectPage, nextPageCursor } from "@/features/account-activity-rollup/lib/page-collector";
import { overlappingOperations } from "@/features/account-activity-rollup/fixtures/operations.fixture";

describe("page collector", () => {
  it("removes duplicate tokens within and across pages", () => {
    const first = overlappingOperations.slice(0, 2);
    const merged = collectPage(first, [first[1]!, overlappingOperations[2]!, overlappingOperations[2]!]);
    expect(merged.map((record) => record.pagingToken)).toEqual(["19", "18", "17"]);
  });
  it("stops on a repeated or empty cursor", () => {
    expect(nextPageCursor(overlappingOperations, "17")).toBeNull();
    expect(nextPageCursor([], "17")).toBeNull();
    expect(nextPageCursor(overlappingOperations, "18")).toBe("17");
    expect(nextPageCursor(overlappingOperations, "16")).toBeNull();
  });
  it("does not reuse a token already included in the aggregate", () => {
    const page = [
      { pagingToken: "40", type: "payment", createdAt: "2024-01-14T00:00:00.000Z" },
      { pagingToken: "30", type: "payment", createdAt: "2024-01-14T00:00:00.000Z" }
    ];
    expect(nextPageCursor(page, "50", [page[1]!])).toBeNull();
  });
});
