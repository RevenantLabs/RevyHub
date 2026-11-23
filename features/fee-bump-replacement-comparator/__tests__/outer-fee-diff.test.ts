import { describe, expect, it } from "vitest";
import {
  compareOuterFees,
  formatFeeDelta
} from "@/features/fee-bump-replacement-comparator/lib/outer-fee-diff";
import type { FeeBumpSideSnapshot } from "@/features/fee-bump-replacement-comparator/types";

function side(overrides: Partial<FeeBumpSideSnapshot> = {}): FeeBumpSideSnapshot {
  return {
    outerFee: "600",
    feeSource: "GABCDEF",
    outerSignatureCount: 1,
    innerHash: "aa",
    innerPayloadXdr: "payload",
    innerSource: "GINNER",
    innerSequence: "1",
    innerOperationCount: 2,
    innerSignatureCount: 1,
    ...overrides
  };
}

describe("compareOuterFees", () => {
  it("reports an exact positive fee delta", () => {
    const result = compareOuterFees(side({ outerFee: "600" }), side({ outerFee: "900" }));
    expect(result.feeDelta).toBe("300");
    expect(result.feeIncreased).toBe(true);
    expect(result.feeDecreased).toBe(false);
  });

  it("reports a lower outer fee without rounding", () => {
    const result = compareOuterFees(side({ outerFee: "600" }), side({ outerFee: "300" }));
    expect(result.feeDelta).toBe("-300");
    expect(result.feeDecreased).toBe(true);
  });

  it("keeps a fee past Number.MAX_SAFE_INTEGER exact", () => {
    const large = "12000000000000000";
    const result = compareOuterFees(side({ outerFee: "600" }), side({ outerFee: large }));
    expect(Number(large)).toBeGreaterThan(Number.MAX_SAFE_INTEGER);
    expect(result.rightOuterFee).toBe(large);
    expect(result.feeDelta).toBe("11999999999999400");
  });

  it("detects a changed fee source", () => {
    const result = compareOuterFees(
      side({ feeSource: "GLEFT" }),
      side({ feeSource: "GRIGHT" })
    );
    expect(result.sameFeeSource).toBe(false);
  });

  it("carries operation and signature counts for both sides", () => {
    const result = compareOuterFees(
      side({ outerSignatureCount: 0, innerOperationCount: 1 }),
      side({ outerSignatureCount: 2, innerOperationCount: 3 })
    );
    expect(result.leftOuterSignatureCount).toBe(0);
    expect(result.rightOuterSignatureCount).toBe(2);
    expect(result.leftInnerOperationCount).toBe(1);
    expect(result.rightInnerOperationCount).toBe(3);
  });
});

describe("formatFeeDelta", () => {
  it("prefixes increases with a plus sign", () => {
    expect(formatFeeDelta("300")).toBe("+300");
    expect(formatFeeDelta("-300")).toBe("-300");
    expect(formatFeeDelta("0")).toBe("0");
  });
});
