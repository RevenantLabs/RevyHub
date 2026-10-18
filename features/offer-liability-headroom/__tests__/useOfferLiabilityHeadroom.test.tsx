import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { useOfferLiabilityHeadroom } from "@/features/offer-liability-headroom/hooks/useOfferLiabilityHeadroom";
import { handlers, rateLimitedHandler } from "@/features/offer-liability-headroom/msw/handlers";
import { accountId } from "@/features/offer-liability-headroom/fixtures/offerLiabilityHeadroom.fixture";
import type { StellarNetwork } from "@/core/network/types";

const server = withMswHandlers(...handlers);

function wrapperFor(network: StellarNetwork) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <NetworkProvider initialNetwork={network}>{children}</NetworkProvider>;
  };
}

describe("useOfferLiabilityHeadroom", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useOfferLiabilityHeadroom(), {
      wrapper: wrapperFor("testnet")
    });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("loads a snapshot", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useOfferLiabilityHeadroom(), {
      wrapper: wrapperFor("testnet")
    });
    await act(async () => {
      await result.current.submit(accountId);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });

  it("surfaces invalid accounts", async () => {
    const { result } = renderHook(() => useOfferLiabilityHeadroom(), {
      wrapper: wrapperFor("testnet")
    });
    await act(async () => {
      await result.current.submit("nope");
    });
    expect(result.current.state).toEqual({ status: "error", code: "invalid_account" });
  });

  it("surfaces rate limiting", async () => {
    server.use(rateLimitedHandler);
    resetHorizonClients();
    const { result } = renderHook(() => useOfferLiabilityHeadroom(), {
      wrapper: wrapperFor("testnet")
    });
    await act(async () => {
      await result.current.submit(accountId);
    });
    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", code: "rate_limited" })
    );
  });

  it("resets", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useOfferLiabilityHeadroom(), {
      wrapper: wrapperFor("testnet")
    });
    await act(async () => {
      await result.current.submit(accountId);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
