import { describe, expect, it } from "vitest";
import { http, HttpResponse, delay } from "msw";
import { withMswHandlers } from "@/core/testing/msw";
import { fetchAccountBatch, MAX_CONCURRENT_ACCOUNTS } from "../lib/account-batch";
import { accountA, accountB, accountC } from "../fixtures/multiAccountAssetExposure.fixture";
import { handlers, rateLimitedHandler, failedHandler, malformedHandler } from "../msw/handlers";
const server = withMswHandlers(...handlers);
describe("bounded account fetches", () => {
  it("preserves successes while reporting 404, 429, 500, and decode failures", async () => {
    expect((await fetchAccountBatch([accountA, accountC], "testnet")).map((row) => row.status))
      .toEqual(["success", "error"]);
    expect((await fetchAccountBatch([accountA, accountC], "testnet"))[1])
      .toMatchObject({ code: "account_not_found" });
    server.use(rateLimitedHandler);
    expect((await fetchAccountBatch([accountA, accountB], "testnet"))[1]).toMatchObject({ code: "rate_limited" });
    server.use(failedHandler);
    expect((await fetchAccountBatch([accountA, accountB], "testnet"))[1]).toMatchObject({ code: "request_failed" });
    server.use(malformedHandler);
    expect((await fetchAccountBatch([accountA, accountB], "testnet"))[1]).toMatchObject({ code: "request_failed" });
  });
  it("never exceeds the worker cap and keeps account order", async () => {
    let active = 0;
    let maximum = 0;
    server.use(http.get("https://horizon-testnet.stellar.org/accounts/*", async () => {
      active++;
      maximum = Math.max(maximum, active);
      await delay(15);
      active--;
      return HttpResponse.json({ balances: [] });
    }));
    const ids = Array.from({ length: 8 }, (_, n) => n % 2 ? accountA : accountB);
    const rows = await fetchAccountBatch(ids, "testnet");
    expect(maximum).toBeLessThanOrEqual(MAX_CONCURRENT_ACCOUNTS);
    expect(maximum).toBe(MAX_CONCURRENT_ACCOUNTS);
    expect(rows.map((row) => row.accountId)).toEqual(ids);
  });
});
