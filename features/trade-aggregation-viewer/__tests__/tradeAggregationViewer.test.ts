import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { pairInput } from "@/features/trade-aggregation-viewer/fixtures/tradeAggregationViewer.fixture";
import { runTradeAggregationViewer } from "@/features/trade-aggregation-viewer/lib/tradeAggregationViewer";
import { emptyHandler, handlers } from "@/features/trade-aggregation-viewer/msw/handlers";

const server = withMswHandlers(...handlers);

describe("runTradeAggregationViewer", () => {
  it("requests the pair and exposes exact OHLC fractions plus aligned bounds", async () => {
    const result = await runTradeAggregationViewer({ value: pairInput }, "testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.buckets[0]?.open).toBe("49/100");
    expect(result.value.buckets[0]?.high).toBe("11/20");
    expect(result.value.buckets[0]?.baseVolume).toBe("120");
    expect(result.value.usedStart).toBe(result.value.buckets[0]?.start);
    expect(result.value.totalTrades).toBe(12);
  });

  it("reports a valid range with no activity as a clear result", async () => {
    server.use(emptyHandler);
    const result = await runTradeAggregationViewer({ value: pairInput }, "testnet");
    expect(result.ok).toBe(true);
    expect(result.ok && result.value.noTrades).toBe(true);
  });
});
