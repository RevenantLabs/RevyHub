import { describe, expect, it } from "vitest";
import { runOperationBudgetPlanner } from "@/features/operation-budget-planner/lib/operationBudgetPlanner";

describe("runOperationBudgetPlanner", () => {
  it("returns a summary for a valid input", async () => {
    const result = await runOperationBudgetPlanner({ value: "example" }, "testnet");
    expect(result.ok).toBe(true);
  });
});
