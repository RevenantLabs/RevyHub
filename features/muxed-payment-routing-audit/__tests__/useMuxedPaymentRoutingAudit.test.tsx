import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider, useNetwork } from "@/core/network/NetworkProvider";
import { withMswHandlers, http, HttpResponse, delay } from "@/core/testing/msw";
import { useMuxedPaymentRoutingAudit } from "@/features/muxed-payment-routing-audit/hooks/useMuxedPaymentRoutingAudit";
import { handlers, paymentPath } from "@/features/muxed-payment-routing-audit/msw/handlers";
import { baseAccount } from "@/features/muxed-payment-routing-audit/fixtures/muxedPaymentRoutingAudit.fixture";
const server = withMswHandlers(...handlers);
const wrapper = ({ children }: { children: React.ReactNode }) => <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
describe("audit state machine", () => {
  it("moves from idle through loading to success", async () => {
    server.use(http.get(paymentPath, async () => { await delay(50); return HttpResponse.json({ _embedded: { records: [] } }); }));
    const { result } = renderHook(() => useMuxedPaymentRoutingAudit(), { wrapper });
    expect(result.current.state.status).toBe("idle");
    act(() => { void result.current.submit(baseAccount); });
    expect(result.current.state.status).toBe("loading");
    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });
  it("reports invalid input and resets", async () => {
    const { result } = renderHook(() => useMuxedPaymentRoutingAudit(), { wrapper });
    await act(async () => { await result.current.submit("Sbad"); });
    expect(result.current.state).toEqual({ status: "error", code: "invalid_account" });
    act(() => result.current.reset());
    expect(result.current.state.status).toBe("idle");
  });
  it("derives stale network results away", async () => {
    const { result } = renderHook(() => ({ audit: useMuxedPaymentRoutingAudit(), network: useNetwork() }), { wrapper });
    await act(async () => { await result.current.audit.submit(baseAccount); });
    expect(result.current.audit.state.status).toBe("success");
    act(() => result.current.network.setNetwork("mainnet"));
    expect(result.current.audit.state.status).toBe("idle");
  });
});
