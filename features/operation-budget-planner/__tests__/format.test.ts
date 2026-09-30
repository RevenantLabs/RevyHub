import { describe, expect, it } from "vitest";
import { formatSummary } from "@/features/operation-budget-planner/lib/format";

describe("formatSummary", () => {
  it("trims the value", () => {
    expect(formatSummary(" example ")).toBe("example");
  });
});
