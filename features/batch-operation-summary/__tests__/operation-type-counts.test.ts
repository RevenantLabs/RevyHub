import { describe, expect, it } from "vitest";
import { countOperationTypes } from "@/features/batch-operation-summary/lib/operation-type-counts";
describe("countOperationTypes", () => {
  it("groups and sorts operation names", () => expect(countOperationTypes([{ type: "payment" }, { type: "manageData" }, { type: "payment" }])).toEqual([{ type: "manageData", count: 1 }, { type: "payment", count: 2 }]));
});
