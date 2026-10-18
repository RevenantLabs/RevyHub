import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { runOrderbookViewer } from "@/features/orderbook-viewer/lib/orderbookViewer";
import { emptyHandler, handlers } from "@/features/orderbook-viewer/msw/handlers";
import { pairInput } from "@/features/orderbook-viewer/fixtures/orderbookViewer.fixture";

const server = withMswHandlers(...handlers);

describe("runOrderbookViewer", () => {
  it("loads both sides, sorts them and preserves exact price_r fractions", async () => {
    const result = await runOrderbookViewer({ value: pairInput }, "testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.bids[0]?.price).toBe("99/100");
    expect(result.value.asks[0]?.price).toBe("101/100");
    expect(result.value.bids[1]?.total).toBe("150");
    expect(result.value.spread).toBe("1/50");
    expect(result.value.spreadPercent).toBe("2.02%");
  });

  it("returns a clear empty result when Horizon has no offers", async () => {
    server.use(emptyHandler);
    const result = await runOrderbookViewer({ value: pairInput }, "testnet");
    expect(result.ok).toBe(true);
    expect(result.ok && result.value.empty).toBe(true);
  });
});
