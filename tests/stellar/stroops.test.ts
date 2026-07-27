import { describe, expect, it } from "vitest";
import { formatStroopAmount } from "../../lib/stellar/stroops";

describe("formatStroopAmount", () => {
  it("converts a stroop string into stroops and XLM", () => {
    expect(formatStroopAmount("1000000")).toEqual({ stroops: "1000000", xlm: "0.1000000" });
  });

  it("converts a numeric stroop value", () => {
    expect(formatStroopAmount(100)).toEqual({ stroops: "100", xlm: "0.0000100" });
  });

  it("returns null for missing values instead of NaN or zero", () => {
    expect(formatStroopAmount(null)).toBeNull();
    expect(formatStroopAmount(undefined)).toBeNull();
  });

  it("returns null for non-numeric values instead of NaN", () => {
    expect(formatStroopAmount("not-a-number")).toBeNull();
    expect(formatStroopAmount("")).toBeNull();
  });
});
