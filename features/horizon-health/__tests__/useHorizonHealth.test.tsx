import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { useHorizonHealth } from "@/features/horizon-health/hooks/useHorizonHealth";
import {
  handlers,
  serverErrorHandler,
  unreachableHandler
} from "@/features/horizon-health/msw/handlers";
import type { StellarNetwork } from "@/core/network/types";

const server = withMswHandlers(...handlers);

function wrapperFor(network: StellarNetwork) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <NetworkProvider initialNetwork={network}>{children}</NetworkProvider>;
  };
}

describe("useHorizonHealth", () => {
  it("starts in idle state without initiating requests", () => {
    const { result } = renderHook(() => useHorizonHealth(), {
      wrapper: wrapperFor("testnet")
    });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("loads health diagnostic for the active network", async () => {
    const { result } = renderHook(() => useHorizonHealth(), {
      wrapper: wrapperFor("testnet")
    });

    await act(async () => {
      await result.current.load();
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    if (result.current.state.status !== "success") return;

    expect(result.current.state.summary.status).toBe("healthy");
    expect(result.current.state.summary.coreLatestLedger).toBe(4634661);
  });

  it("surfaces transport errors when the endpoint is unreachable", async () => {
    server.use(unreachableHandler);
    const { result } = renderHook(() => useHorizonHealth(), {
      wrapper: wrapperFor("testnet")
    });

    await act(async () => {
      await result.current.load();
    });

    await waitFor(() =>
      expect(result.current.state).toEqual({
        status: "error",
        code: "endpoint_unreachable"
      })
    );
  });

  it("surfaces server errors as request_failed", async () => {
    server.use(serverErrorHandler);
    const { result } = renderHook(() => useHorizonHealth(), {
      wrapper: wrapperFor("testnet")
    });

    await act(async () => {
      await result.current.load();
    });

    await waitFor(() =>
      expect(result.current.state).toEqual({
        status: "error",
        code: "request_failed"
      })
    );
  });

  it("resets state back to idle", async () => {
    const { result } = renderHook(() => useHorizonHealth(), {
      wrapper: wrapperFor("testnet")
    });

    await act(async () => {
      await result.current.load();
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
