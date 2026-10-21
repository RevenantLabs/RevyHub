import { describe, expect, it } from "vitest";
import { formatCount, formatStroops, formatXlm, stroopsToXlm } from "@/features/reserve-capacity-planner/lib/format";

describe("reserve capacity formatting", () => {
  it("converts stroops to a fixed seven-decimal amount", () => {
    expect(stroopsToXlm(60_000_000n)).toBe("6.0000000");
    expect(stroopsToXlm(3n)).toBe("0.0000003");
    expect(stroopsToXlm(150_000_000n)).toBe("15.0000000");
    expect(stroopsToXlm(5_000_000n)).toBe("0.5000000");
  });

  it("formats XLM without floating-point rounding", () => {
    expect(formatXlm("6.0000000")).toBe("6 XLM");
    expect(formatXlm("0.5000000")).toBe("0.5 XLM");
    expect(formatXlm("0.0000003")).toBe("0.0000003 XLM");
    expect(formatXlm("1250.5000000")).toBe("1,250.5 XLM");
    expect(formatXlm("15.0000000")).toBe("15 XLM");
  });

  it("groups stroops and counts", () => {
    expect(formatStroops("60000000")).toBe("60,000,000 stroops");
    expect(formatStroops("5000000")).toBe("5,000,000 stroops");
    expect(formatCount("10")).toBe("10");
    expect(formatCount("1000")).toBe("1,000");
  });
});
