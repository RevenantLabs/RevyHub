import { describe, expect, it } from "vitest";
import { formatFeePercent } from "../lib/format";

describe("formatFeePercent", () => {
  it("formats 30 bps as 0.30%", () => {
    expect(formatFeePercent(30)).toBe("0.30%");
  });

  it("formats 0 and the maximum", () => {
    expect(formatFeePercent(0)).toBe("0.00%");
    expect(formatFeePercent(10_000)).toBe("100.00%");
  });
});
