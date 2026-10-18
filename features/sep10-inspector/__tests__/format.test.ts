import { describe, expect, it } from "vitest";
import { formatSummary } from "@/features/sep10-inspector/lib/format";

describe("formatSummary", () => {
  it("trims the value", () => {
    expect(formatSummary(" example ")).toBe("example");
  });
});
