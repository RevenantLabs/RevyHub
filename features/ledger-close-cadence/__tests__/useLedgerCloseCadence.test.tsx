import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { useLedgerCloseCadence } from "@/features/ledger-close-cadence/hooks/useLedgerCloseCadence";
import { handlers, rateLimitedHandler } from "@/features/ledger-close-cadence/msw/handlers";
import type { StellarNetwork } from "@/core/network/types";

const server = withMswHandlers(...handlers);

function wrapperFor(network: StellarNetwork) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <NetworkProvider initialNetwork={network}>{children}</NetworkProvider>;
  };
}

describe("useLedgerCloseCadence", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useLedgerCloseCadence(), {
      wrapper: wrapperFor("testnet")
    });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("loads cadence for the selected network", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useLedgerCloseCadence(), {
      wrapper: wrapperFor("testnet")
    });

    await act(async () => {
      await result.current.submit({ sampleSize: "4" });
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });

  it("reads mainnet fixtures when mainnet is selected", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useLedgerCloseCadence(), {
      wrapper: wrapperFor("mainnet")
    });

    await act(async () => {
      await result.current.submit({ sampleSize: "4" });
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    if (result.current.state.status !== "success") return;
    expect(result.current.state.result.sequenceGaps.length).toBeGreaterThan(0);
  });

  it("surfaces invalid sample size without fetching", async () => {
    const { result } = renderHook(() => useLedgerCloseCadence(), {
      wrapper: wrapperFor("testnet")
    });

    await act(async () => {
      await result.current.submit({ sampleSize: "1" });
    });

    expect(result.current.state).toEqual({ status: "error", code: "invalid_sample_size" });
  });

  it("surfaces rate limiting", async () => {
    server.use(rateLimitedHandler);
    resetHorizonClients();
    const { result } = renderHook(() => useLedgerCloseCadence(), {
      wrapper: wrapperFor("testnet")
    });

    await act(async () => {
      await result.current.submit({ sampleSize: "4" });
    });

    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", code: "rate_limited" })
    );
  });

  it("clears the reading on reset", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useLedgerCloseCadence(), {
      wrapper: wrapperFor("testnet")
    });

    await act(async () => {
      await result.current.submit({ sampleSize: "4" });
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
