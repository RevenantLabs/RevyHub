import { describe, expect, it } from "vitest";
import { parseOperationBudgetPlannerInput } from "@/features/operation-budget-planner/schema";

describe("parseOperationBudgetPlannerInput", () => {
  it("rejects empty input", () => {
    const result = parseOperationBudgetPlannerInput("   ");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("normalises surrounding whitespace", () => {
    const result = parseOperationBudgetPlannerInput("  example  ");
    expect(result.ok && result.value.value).toBe("example");
  });
});
