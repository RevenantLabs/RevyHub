import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { useFeeStats } from "@/features/fee-stats/hooks/useFeeStats";
import { handlers, rateLimitedHandler } from "@/features/fee-stats/msw/handlers";
import type { StellarNetwork } from "@/core/network/types";

const server = withMswHandlers(...handlers);

function wrapperFor(network: StellarNetwork) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <NetworkProvider initialNetwork={network}>{children}</NetworkProvider>;
  };
}

describe("useFeeStats", () => {
  it("starts idle and makes no request until asked", () => {
    const { result } = renderHook(() => useFeeStats(), { wrapper: wrapperFor("testnet") });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("loads statistics for the selected network", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useFeeStats(), { wrapper: wrapperFor("testnet") });

    await act(async () => {
      await result.current.load();
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    expect(result.current.state).toMatchObject({ summary: { lastLedger: "1017696" } });
  });

  it("reads mainnet statistics when mainnet is selected", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useFeeStats(), { wrapper: wrapperFor("mainnet") });

    await act(async () => {
      await result.current.load();
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    if (result.current.state.status !== "success") return;
    expect(result.current.state.summary.capacityUsage).toBeCloseTo(0.97);
  });

  it("surfaces rate limiting", async () => {
    server.use(rateLimitedHandler);
    resetHorizonClients();
    const { result } = renderHook(() => useFeeStats(), { wrapper: wrapperFor("testnet") });

    await act(async () => {
      await result.current.load();
    });

    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", code: "rate_limited" })
    );
  });

  it("clears the reading on reset", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useFeeStats(), { wrapper: wrapperFor("testnet") });

    await act(async () => {
      await result.current.load();
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
