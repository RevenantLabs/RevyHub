import { describe, expect, it } from "vitest";
import { groupByType, groupByUtcDay } from "@/features/account-activity-rollup/lib/activity-groups";
import { overlappingOperations } from "@/features/account-activity-rollup/fixtures/operations.fixture";

describe("activity groups", () => {
  it("sorts types by count then name", () => {
    expect(groupByType(overlappingOperations)).toEqual([{ key: "payment", count: 2 }, { key: "change_trust", count: 1 }]);
    expect(groupByType(overlappingOperations.slice(0, 2)).map((group) => group.key)).toEqual(["change_trust", "payment"]);
  });
  it("groups by UTC day newest first across midnight", () => {
    expect(groupByUtcDay(overlappingOperations)).toEqual([{ key: "2024-01-16", count: 1 }, { key: "2024-01-15", count: 2 }]);
  });
});
