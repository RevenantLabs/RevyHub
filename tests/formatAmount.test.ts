import { describe, it, expect } from "vitest";
import { formatAssetAmount } from "@/lib/stellar/formatAmount";

describe("formatAssetAmount", () => {
  it("formats zero", () => {
    const res = formatAssetAmount("0");
    expect(res.raw).toBe("0");
    expect(res.display).toBe("0");
  });

  it("formats a large integer with grouping and preserves raw", () => {
    const raw = "12345678901234567890.0000000";
    const res = formatAssetAmount(raw);
    expect(res.raw).toBe(raw);
    // integer grouped; fractional trimmed (all zeros) -> integer only (or compacted if too long)
    expect(res.display.includes("123,456")).toBe(true);
  });

  it("keeps tiny seven-decimal values exact", () => {
    const tiny = "0.0000001";
    const res = formatAssetAmount(tiny);
    expect(res.raw).toBe(tiny);
    expect(res.display).toBe("0.0000001");
  });

  it("marks malformed values and returns them unchanged", () => {
    const malformed = "abc.def";
    const res = formatAssetAmount(malformed);
    expect(res.malformed).toBe(true);
    expect(res.display).toBe(malformed);
  });
});
