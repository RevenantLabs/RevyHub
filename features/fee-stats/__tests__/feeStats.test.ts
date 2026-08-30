import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import {
  multiplyStroops,
  parseOperationCount,
  toStroopAmount
} from "@/features/fee-stats/lib/stroops";
import { resetHorizonClients } from "@/core/horizon/client";
import {
  getFeeStats,
  normalizeFeeStats,
  parseCapacityUsage
} from "@/features/fee-stats/lib/feeStats";
import {
  handlers,
  malformedHandler,
  rateLimitedHandler
} from "@/features/fee-stats/msw/handlers";
import {
  calmFeeStats,
  noCapacityFeeStats
} from "@/features/fee-stats/fixtures/feeStats.fixture";

const server = withMswHandlers(...handlers);

describe("operation count helpers", () => {
  it("accepts counts from 1 through 100", () => {
    expect(parseOperationCount("1")).toBe(1);
    expect(parseOperationCount("100")).toBe(100);
  });

  it("rejects empty, invalid, zero, negative, and over-limit counts", () => {
    expect(parseOperationCount("")).toBeNull();
    expect(parseOperationCount("0")).toBeNull();
    expect(parseOperationCount("-3")).toBeNull();
    expect(parseOperationCount("101")).toBeNull();
    expect(parseOperationCount("2.5")).toBeNull();
    expect(parseOperationCount("abc")).toBeNull();
  });

  it("multiplies stroop amounts exactly with BigInt", () => {
    const perOp = toStroopAmount("35000");
    expect(perOp && multiplyStroops(perOp, 3)).toEqual({
      stroops: "105000",
      xlm: "0.0105000"
    });
  });
});

describe("parseCapacityUsage", () => {
  it("accepts a fraction between zero and one", () => {
    expect(parseCapacityUsage("0.08")).toBeCloseTo(0.08);
    expect(parseCapacityUsage("1")).toBe(1);
    expect(parseCapacityUsage("0")).toBe(0);
  });

  it("rejects values outside the range or unparseable", () => {
    expect(parseCapacityUsage("1.5")).toBeNull();
    expect(parseCapacityUsage("-0.1")).toBeNull();
    expect(parseCapacityUsage("lots")).toBeNull();
    expect(parseCapacityUsage(undefined)).toBeNull();
  });
});

describe("normalizeFeeStats", () => {
  it("converts every percentile into a stroops/XLM pair", () => {
    const summary = normalizeFeeStats(calmFeeStats);

    expect(summary.chargedPercentiles).toHaveLength(11);
    expect(summary.chargedPercentiles[0]).toEqual({
      label: "P10",
      value: { stroops: "100", xlm: "0.0000100" }
    });
  });

  it("keeps the charged and offered distributions separate", () => {
    const summary = normalizeFeeStats(calmFeeStats);

    expect(summary.chargedMode?.stroops).toBe("100");
    expect(summary.maxFeeMode?.stroops).toBe("10000");
  });

  it("degrades to null when capacity is missing rather than failing", () => {
    const summary = normalizeFeeStats(noCapacityFeeStats);

    expect(summary.capacityUsage).toBeNull();
    expect(summary.chargedPercentiles).toHaveLength(11);
  });
});

describe("getFeeStats", () => {
  it("returns a normalised summary", async () => {
    resetHorizonClients();
    const result = await getFeeStats("testnet");

    expect(result.ok).toBe(true);
    expect(result.ok && result.value.lastLedger).toBe("1017696");
  });

  it("reads different statistics per network", async () => {
    resetHorizonClients();
    const [testnet, mainnet] = await Promise.all([
      getFeeStats("testnet"),
      getFeeStats("mainnet")
    ]);

    expect(testnet.ok && testnet.value.capacityUsage).toBeCloseTo(0.08);
    expect(mainnet.ok && mainnet.value.capacityUsage).toBeCloseTo(0.97);
  });

  it("rejects a response that is not a fee-stats document", async () => {
    server.use(malformedHandler);
    resetHorizonClients();

    expect(await getFeeStats("testnet")).toEqual({ ok: false, code: "unexpected_response" });
  });

  it("maps a 429 to rate_limited", async () => {
    server.use(rateLimitedHandler);
    resetHorizonClients();

    expect(await getFeeStats("testnet")).toEqual({ ok: false, code: "rate_limited" });
  });
});
