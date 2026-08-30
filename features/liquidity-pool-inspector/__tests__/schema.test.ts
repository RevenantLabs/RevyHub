import { describe, expect, it } from "vitest";
import {
  isLikelyPoolId,
  parseLiquidityPoolInspectorInput
} from "@/features/liquidity-pool-inspector/schema";
import { poolId } from "@/features/liquidity-pool-inspector/fixtures/liquidityPoolInspector.fixture";

describe("isLikelyPoolId", () => {
  it("accepts exactly 64 hexadecimal characters", () => {
    expect(isLikelyPoolId("a".repeat(64))).toBe(true);
    expect(isLikelyPoolId("ABCDEF0123456789".repeat(4))).toBe(true);
  });

  it("rejects the wrong length", () => {
    expect(isLikelyPoolId("a".repeat(63))).toBe(false);
    expect(isLikelyPoolId("a".repeat(65))).toBe(false);
  });

  it("rejects non-hexadecimal characters", () => {
    expect(isLikelyPoolId("z".repeat(64))).toBe(false);
  });
});

describe("parseLiquidityPoolInspectorInput", () => {
  it("rejects empty input", () => {
    expect(parseLiquidityPoolInspectorInput("   ")).toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects an account address", () => {
    expect(parseLiquidityPoolInspectorInput("GABC")).toEqual({
      ok: false,
      code: "invalid_pool_id"
    });
  });

  it("lower-cases the pool ID to match Horizon's rendering", () => {
    const result = parseLiquidityPoolInspectorInput("ABCDEF0123456789".repeat(4));
    expect(result.ok && result.value.poolId).toBe("abcdef0123456789".repeat(4));
  });

  it("strips whitespace from a wrapped paste", () => {
    const result = parseLiquidityPoolInspectorInput(`${poolId.slice(0, 30)}\n ${poolId.slice(30)}`);
    expect(result.ok && result.value.poolId).toBe(poolId);
  });
});
