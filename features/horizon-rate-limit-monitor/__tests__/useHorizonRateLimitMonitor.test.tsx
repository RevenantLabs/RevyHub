import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { NetworkProvider, useNetwork } from "@/core/network/NetworkProvider";
import { HORIZON_URLS } from "@/core/network/config";
import { withMswHandlers } from "@/core/testing/msw";
import { useHorizonRateLimitMonitor } from "@/features/horizon-rate-limit-monitor/hooks/useHorizonRateLimitMonitor";
import { handlers, rateLimitedHandler } from "@/features/horizon-rate-limit-monitor/msw/handlers";
const server = withMswHandlers(...handlers);
const wrapper = ({ children }: { children: React.ReactNode }) => <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;

describe("monitor state machine", () => {
  it("moves from idle through loading to success", async () => {
    const { result } = renderHook(() => useHorizonRateLimitMonitor(), { wrapper });
    expect(result.current.state.status).toBe("idle");
    act(() => { void result.current.check("", "10"); });
    expect(result.current.state.status).toBe("loading");
    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });
  it("shows an error code for a rejected request", async () => {
    server.use(rateLimitedHandler);
    const { result } = renderHook(() => useHorizonRateLimitMonitor(), { wrapper });
    await act(async () => { await result.current.check("", "10"); });
    expect(result.current.state).toEqual({ status: "error", code: "rate_limited" });
  });
  it("derives idle state when the selected network changes", async () => {
    const { result } = renderHook(() => ({ monitor: useHorizonRateLimitMonitor(), setNetwork: useNetwork().setNetwork }), { wrapper });
    await act(async () => { await result.current.monitor.check("", "10"); });
    expect(result.current.monitor.state.status).toBe("success");
    act(() => result.current.setNetwork("mainnet"));
    expect(result.current.monitor.state.status).toBe("idle");
  });
  it("cancels an in-flight check when the network changes", async () => {
    let release!: () => void;
    let started = false;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    server.use(http.get(`${HORIZON_URLS.testnet}/`, async () => {
      started = true;
      await gate;
      return new HttpResponse(null, { status: 200 });
    }));
    const { result } = renderHook(() => ({ monitor: useHorizonRateLimitMonitor(), setNetwork: useNetwork().setNetwork }), { wrapper });
    let check!: Promise<void>;
    act(() => { check = result.current.monitor.check("", "10"); });
    await waitFor(() => expect(started).toBe(true));
    act(() => result.current.setNetwork("mainnet"));
    expect(result.current.monitor.state.status).toBe("idle");
    act(() => result.current.setNetwork("testnet"));
    release();
    await act(async () => { await check; });
    expect(result.current.monitor.state.status).toBe("idle");
  });
});
