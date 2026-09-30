import { describe, expect, it } from "vitest";
import { parseTransactionTimeboundPlannerInput } from "@/features/transaction-timebound-planner/schema";

describe("parseTransactionTimeboundPlannerInput", () => {
  it("rejects empty input", () => {
    const result = parseTransactionTimeboundPlannerInput("   ");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("normalises surrounding whitespace", () => {
    const result = parseTransactionTimeboundPlannerInput("  example  ");
    expect(result.ok && result.value.value).toBe("example");
  });
});
