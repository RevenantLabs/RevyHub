import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider, useNetwork } from "@/core/network/NetworkProvider";
import { withMswHandlers, http, HttpResponse, delay } from "@/core/testing/msw";
import { useAccountActivityRollup } from "@/features/account-activity-rollup/hooks/useAccountActivityRollup";
import { handlers } from "@/features/account-activity-rollup/msw/handlers";
import { accountId } from "@/features/account-activity-rollup/fixtures/accountActivityRollup.fixture";

const server = withMswHandlers(...handlers);
function wrapper({ children }: { children: React.ReactNode }) { return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>; }

describe("useAccountActivityRollup", () => {
  it("moves through idle, loading, success and page loading", async () => {
    server.use(http.get(`https://horizon-testnet.stellar.org/accounts/${accountId}/operations`, async ({ request }) => {
      if (!new URL(request.url).searchParams.has("cursor")) { await delay(80); return undefined; }
      return undefined;
    }));
    const { result } = renderHook(() => useAccountActivityRollup(), { wrapper });
    expect(result.current.state.status).toBe("idle");
    let request: Promise<void>;
    act(() => { request = result.current.submit(accountId); });
    expect(result.current.state.status).toBe("loading");
    await act(async () => { await request!; });
    expect(result.current.state.status).toBe("success");
    await act(async () => { await result.current.loadMore(); });
    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") expect(result.current.state.result.coverage.pages).toBe(2);
  });
  it("keeps a secret out of hook state and reports an error", async () => {
    const { result } = renderHook(() => useAccountActivityRollup(), { wrapper });
    await act(async () => { await result.current.submit("Snot-a-public-address"); });
    expect(result.current.state).toEqual({ status: "error", code: "invalid_account" });
    expect(JSON.stringify(result.current.state)).not.toContain("Snot-a-public-address");
  });
  it("hides an old network result after network selection changes", async () => {
    const { result } = renderHook(() => ({ activity: useAccountActivityRollup(), network: useNetwork() }), { wrapper });
    await act(async () => { await result.current.activity.submit(accountId); });
    expect(result.current.activity.state.status).toBe("success");
    act(() => result.current.network.setNetwork("mainnet"));
    await waitFor(() => expect(result.current.activity.state.status).toBe("idle"));
  });
  it("preserves a successful aggregate after a failed next page", async () => {
    const { result } = renderHook(() => useAccountActivityRollup(), { wrapper });
    await act(async () => { await result.current.submit(accountId); });
    server.use(http.get(`https://horizon-testnet.stellar.org/accounts/${accountId}/operations`, ({ request }) => new URL(request.url).searchParams.has("cursor") ? HttpResponse.json({}, { status: 429 }) : undefined));
    await act(async () => { await result.current.loadMore(); });
    if (result.current.state.status !== "success") throw new Error("expected success");
    expect(result.current.state.pageError).toBe("rate_limited");
    expect(result.current.state.result.coverage.records).toBe(20);
  });
});
