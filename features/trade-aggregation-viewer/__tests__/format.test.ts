import { describe, expect, it } from "vitest";
import { formatSummary } from "@/features/trade-aggregation-viewer/lib/format";

describe("formatSummary", () => {
  it("trims the value", () => {
    expect(formatSummary(" example ")).toBe("example");
  });
});
