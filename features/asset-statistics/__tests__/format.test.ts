import { describe, expect, it } from "vitest";
import { formatAmount } from "@/features/asset-statistics/lib/format";

describe("formatAmount", () => {
  it("formats integer correctly", () => {
    expect(formatAmount("1234567.0000000")).toBe("1,234,567");
  });

  it("formats fractional correctly", () => {
    expect(formatAmount("1234.5600000")).toBe("1,234.56");
  });

  it("formats zero correctly", () => {
    expect(formatAmount("0.0000000")).toBe("0");
  });
});
