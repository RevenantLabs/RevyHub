import { describe, expect, it } from "vitest";
import { formatAsset, formatBasisPoints } from "@/features/path-payment-slippage-calculator/lib/format";
describe("slippage formatting", () => {
  it("formats signed basis points", () => expect(formatBasisPoints("-526")).toBe("-5.26%"));
  it("formats native assets", () => expect(formatAsset({ type: "native", code: "XLM", issuer: null })).toBe("XLM"));
});
