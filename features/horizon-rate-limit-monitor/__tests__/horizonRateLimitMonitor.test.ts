import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { http, HttpResponse } from "msw";
import { HORIZON_URLS } from "@/core/network/config";
import { getHorizonRateLimits } from "@/features/horizon-rate-limit-monitor/lib/horizonRateLimitMonitor";
import { accountId } from "@/features/horizon-rate-limit-monitor/fixtures/horizonRateLimitMonitor.fixture";
import { handlers, missingHandler, partialHandler, malformedHandler, rateLimitedHandler, failedHandler } from "@/features/horizon-rate-limit-monitor/msw/handlers";
const server = withMswHandlers(...handlers);

describe("Horizon rate limit monitor", () => {
  it("reads the three headers from every requested endpoint", async () => {
    const result = await getHorizonRateLimits("testnet", accountId, "10");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.endpoints.map((row) => row.endpoint)).toEqual(["/", "/ledgers", `/accounts/${accountId}`]);
    expect(result.value.endpoints.map((row) => row.headers.reporting)).toEqual(["reported", "reported", "reported"]);
    expect(result.value.endpoints.map((row) => row.headers.remaining)).toEqual(["500", "8", "500"]);
    expect(result.value.endpoints.map((row) => row.lowQuota)).toEqual([false, true, false]);
  });
  it("uses the selected network and omits the optional account endpoint", async () => {
    const result = await getHorizonRateLimits("mainnet", "", "10");
    expect(result.ok && result.value.network).toBe("mainnet");
    expect(result.ok && result.value.endpoints).toHaveLength(2);
  });
  it("treats an omitted endpoint's headers as not reported", async () => {
    server.use(missingHandler);
    const result = await getHorizonRateLimits("testnet", "", "10");
    expect(result.ok && result.value.endpoints[1]).toMatchObject({ headers: { reporting: "not_reported", remaining: null }, lowQuota: false });
  });
  it("keeps partial values and reports the missing fields", async () => {
    server.use(partialHandler);
    const result = await getHorizonRateLimits("testnet", "", "10");
    expect(result.ok && result.value.endpoints[1].headers).toMatchObject({ limit: "1000", remaining: null, reporting: "partial" });
  });
  it.each([
    [malformedHandler, "missing_headers"], [rateLimitedHandler, "rate_limited"], [failedHandler, "request_failed"]
  ])("maps an endpoint failure to %s", async (handler, code) => {
    server.use(handler);
    expect(await getHorizonRateLimits("testnet", "", "10")).toEqual({ ok: false, code });
  });
  it("rejects malformed account input before any request", async () => {
    let requests = 0;
    server.use(http.get(`${HORIZON_URLS.testnet}/`, () => { requests += 1; return new HttpResponse(null); }));
    expect(await getHorizonRateLimits("testnet", "Snot-a-seed", "10")).toEqual({ ok: false, code: "invalid_account" });
    expect(requests).toBe(0);
  });
});
