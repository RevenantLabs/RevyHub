import { describe, expect, it } from "vitest";
import { calculateSlippageBasisPoints } from "@/features/path-payment-slippage-calculator/lib/slippage-math";
describe("calculateSlippageBasisPoints", () => {
  it("measures strict-send above the minimum", () => expect(calculateSlippageBasisPoints("strict-send", "9.5000000", "10.0000000")).toEqual({ ok: true, value: "526" }));
  it("measures strict-receive below the maximum", () => expect(calculateSlippageBasisPoints("strict-receive", "12.0000000", "11.4000000")).toEqual({ ok: true, value: "500" }));
  it("rejects malformed amounts", () => expect(calculateSlippageBasisPoints("strict-send", "0", "1")).toEqual({ ok: false, code: "malformed_effect" }));
});
