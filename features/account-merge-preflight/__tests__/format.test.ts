import { describe, expect, it } from "vitest";
import { formatAmount } from "@/features/account-merge-preflight/lib/format";

describe("formatAmount", () => {
  it("formats integers", () => {
    expect(formatAmount("1234")).toBe("1,234");
  });

  it("formats floats", () => {
    expect(formatAmount("1234.5600")).toBe("1,234.56");
    expect(formatAmount("0.0000000")).toBe("0");
  });
});
