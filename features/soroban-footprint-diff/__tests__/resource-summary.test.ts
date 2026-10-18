import { describe, expect, it } from "vitest";
import { summarizeResources } from "@/features/soroban-footprint-diff/lib/resource-summary";

describe("summarizeResources", () => {
  it("includes only present fields", () => {
    expect(
      summarizeResources({
        minResourceFee: "100",
        cpuInsns: null,
        memBytes: "2",
        labeledAsSimulation: true
      })
    ).toEqual({
      hasAny: true,
      rows: [
        { label: "minResourceFee", value: "100" },
        { label: "memBytes", value: "2" }
      ]
    });
  });

  it("reports empty summaries", () => {
    expect(
      summarizeResources({
        minResourceFee: null,
        cpuInsns: null,
        memBytes: null,
        labeledAsSimulation: true
      }).hasAny
    ).toBe(false);
  });
});
