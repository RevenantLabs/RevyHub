import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { handlers } from "@/features/trade-history/msw/handlers";
import { runTradeHistory } from "@/features/trade-history/lib/tradeHistory";
import { accountFilter, pairInput as pairRequest } from "@/features/trade-history/fixtures/tradeHistory.fixture";

const server = withMswHandlers(...handlers);

describe("runTradeHistory", () => {
  it("supports pair filters and preserves counterparties and exact price fractions", async () => {
    const result = await runTradeHistory({ value: pairRequest }, "testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.filterMode).toBe("pair");
    expect(result.value.records[0]?.price).toBe("1/2");
    expect(result.value.records[0]?.base.account).toBe(accountFilter);
    expect(result.value.records[0]?.kind).toBe("orderbook");
    expect(result.value.hasNext).toBe(true);
  });

  it("supports account filters and cursor pages", async () => {
    const result = await runTradeHistory({ value: JSON.stringify({ account: accountFilter, limit: 2 }) }, "testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const next = await import("@/features/trade-history/lib/tradeHistory").then(({ loadTradeHistoryPage }) => loadTradeHistoryPage(result.value, "testnet", "next"));
    expect(next.ok).toBe(true);
    expect(next.ok && next.value.page).toBe(2);
    expect(next.ok && next.value.records[0]?.kind).toBe("liquidity_pool");
  });

  it("returns a clear no-trades result for an empty collection", async () => {
    server.use((await import("@/features/trade-history/msw/handlers")).emptyHandler);
    const result = await runTradeHistory({ value: pairRequest }, "testnet");
    expect(result.ok && result.value.noTrades).toBe(true);
  });
});
