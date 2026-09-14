import { describe, expect, it } from "vitest";
import { formatXlm, formatCount } from "@/features/soroban-fee-estimator/lib/format";

describe("formatXlm", () => {
  it("formats stroops as XLM", () => {
    expect(formatXlm(10000000n)).toBe("1.0000000");
    expect(formatXlm(1n)).toBe("0.0000001");
    expect(formatXlm(123456789n)).toBe("12.3456789");
  });

  it("formats zero", () => {
    expect(formatXlm(0n)).toBe("0.0000000");
  });
});

describe("formatCount", () => {
  it("formats instructions", () => {
    expect(formatCount(100000n, "instructions")).toBe("100,000 instructions");
  });

  it("formats bytes", () => {
    expect(formatCount(1024n, "bandwidth")).toBe("1,024 bytes");
  });
});
