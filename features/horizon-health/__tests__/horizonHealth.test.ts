import { afterEach, expect, it, vi } from "vitest";
import { withMswHandlers, http, HttpResponse, delay } from "@/core/testing/msw";
import { horizonUrl, resetHorizonClients } from "@/core/horizon/client";
import { runHorizonHealth } from "../lib/horizonHealth";
import { toHorizonHealthErrorCode } from "../lib/horizonHealth.errors";
import { handlers } from "../msw/handlers";
import { horizonHealthFixture as root, observedAt } from "../fixtures/horizonHealth.fixture";
const server = withMswHandlers(...handlers);
const url = horizonUrl("testnet", "/");
const run = () => {resetHorizonClients(); return runHorizonHealth({inspect: true}, "testnet");};
afterEach(() => vi.useRealTimers());
it("shows measured history, versions and absent headers with observation time", async () => {
 vi.useFakeTimers({toFake: ["Date"]}); vi.setSystemTime(new Date(observedAt));
 expect(await run()).toEqual({ok: true, value: { endpoint: url, observedAt, coreLatest: 1000, historyLatest: 998, historyElder: 100, lag: 2, degraded: false, horizonVersion: root.horizon_version, coreVersion: root.core_version, rateLimit: {limit: null, remaining: null, reset: null} }});
});
it.each([[5, false], [6, true], [-1, false]])("lag %s preserves successful diagnostics", async (lag, degraded) => {
 server.use(http.get(url, () => HttpResponse.json({...root, history_latest_ledger: 1000-lag}, {headers: {"X-Ratelimit-Limit": "100", "X-Ratelimit-Remaining": "0", "X-Ratelimit-Reset": "60"}})));
 const r = await run(); expect(r.ok && r.value.degraded).toBe(degraded); expect(r.ok && r.value.rateLimit.remaining).toBe("0"); expect(r.ok && r.value.lag).toBe(Math.max(0, lag));
});
it("rejects malformed root and non-JSON responses", async () => {
 server.use(http.get(url, () => HttpResponse.json({}))); expect(await run()).toEqual({ok:false, code:"unexpected_response"});
 server.use(http.get(url, () => HttpResponse.text("html"))); expect(await run()).toEqual({ok:false, code:"unexpected_response"});
});
it.each([429, 500])("reports HTTP %s as retryable failure", async status => {server.use(http.get(url, () => new HttpResponse(null, {status}))); expect(await run()).toEqual({ok:false,code:"request_failed"});});
it("reports a network failure separately", async () => {server.use(http.get(url, () => HttpResponse.error())); expect(await run()).toEqual({ok:false,code:"endpoint_unreachable"});});
it("bounds an unresponsive endpoint at ten seconds", async () => {
 vi.useFakeTimers(); server.use(http.get(url, async () => {await delay(11000); return HttpResponse.json(root);}));
 const pending = run(); await vi.advanceTimersByTimeAsync(10001); expect(await pending).toEqual({ok:false,code:"request_failed"});
});
it("maps timeout and unknown failures without throwing", () => {expect(toHorizonHealthErrorCode(new Error("timeout"))).toBe("request_failed"); expect(toHorizonHealthErrorCode(null)).toBe("request_failed");});
