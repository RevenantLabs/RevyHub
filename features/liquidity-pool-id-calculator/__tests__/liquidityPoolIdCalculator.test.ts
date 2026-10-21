import { describe, expect, it } from "vitest";
import { parseInput } from "../schema";
import { calculateLiquidityPoolId } from "../lib/liquidityPoolIdCalculator";
import { sample } from "../fixtures/liquidityPoolIdCalculator.fixture";
import { reversed } from "../fixtures/reversed-input-order.fixture";

function run(raw: typeof sample) {
  const parsed = parseInput(raw);
  if (!parsed.ok) throw new Error("fixture should parse");
  return calculateLiquidityPoolId(parsed.value);
}

describe("calculateLiquidityPoolId", () => {
  it("computes a pool ID and shows the canonical ordering", () => {
    const result = run(sample);
    expect(result.ok).toBe(true);
    expect(result.ok && result.value.poolIdHex).toMatch(/^[0-9a-f]{64}$/);
    expect(result.ok && result.value.ordering.assetA.isNative).toBe(true);
  });

  it("computes the same pool ID regardless of input order", () => {
    const forward = run(sample);
    const backward = run(reversed);
    expect(forward.ok && backward.ok).toBe(true);
    expect(forward.ok && backward.ok && forward.value.poolIdHex).toBe(backward.ok && backward.value.poolIdHex);
  });

  it("reports swapped only for the input order that didn't already match the canonical order", () => {
    // sample is { USDC, native } — native sorts first, so this input needs swapping.
    const forward = run(sample);
    // reversed is { native, USDC } — already in canonical order.
    const backward = run(reversed);
    expect(forward.ok && forward.value.ordering.swapped).toBe(true);
    expect(backward.ok && backward.value.ordering.swapped).toBe(false);
  });

  it("rejects identical assets end to end", () => {
    const result = run({ ...sample, assetYCode: sample.assetXCode, assetYIssuer: sample.assetXIssuer });
    expect(!result.ok && result.code).toBe("identical_assets");
  });
});
