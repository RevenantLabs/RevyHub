import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { useLedgerProtocolTransitionMap } from "@/features/ledger-protocol-transition-map/hooks/useLedgerProtocolTransitionMap";
import { handlers, rateLimitedHandler } from "@/features/ledger-protocol-transition-map/msw/handlers";
import type { StellarNetwork } from "@/core/network/types";

const server = withMswHandlers(...handlers);

function wrapperFor(network: StellarNetwork) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <NetworkProvider initialNetwork={network}>{children}</NetworkProvider>;
  };
}

describe("useLedgerProtocolTransitionMap", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useLedgerProtocolTransitionMap(), {
      wrapper: wrapperFor("testnet")
    });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("loads a protocol map", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useLedgerProtocolTransitionMap(), {
      wrapper: wrapperFor("testnet")
    });

    await act(async () => {
      await result.current.submit({ startLedger: "1000", count: "4" });
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });

  it("loads uncertain mainnet fixtures", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useLedgerProtocolTransitionMap(), {
      wrapper: wrapperFor("mainnet")
    });

    await act(async () => {
      await result.current.submit({ startLedger: "2000", count: "4" });
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    if (result.current.state.status !== "success") return;
    expect(result.current.state.result.transitions[0]?.certainty).toBe("uncertain");
  });

  it("surfaces invalid start ledger", async () => {
    const { result } = renderHook(() => useLedgerProtocolTransitionMap(), {
      wrapper: wrapperFor("testnet")
    });

    await act(async () => {
      await result.current.submit({ startLedger: "0", count: "4" });
    });

    expect(result.current.state).toEqual({ status: "error", code: "invalid_start_ledger" });
  });

  it("surfaces rate limiting", async () => {
    server.use(rateLimitedHandler);
    resetHorizonClients();
    const { result } = renderHook(() => useLedgerProtocolTransitionMap(), {
      wrapper: wrapperFor("testnet")
    });

    await act(async () => {
      await result.current.submit({ startLedger: "1000", count: "4" });
    });

    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", code: "rate_limited" })
    );
  });

  it("resets to idle", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useLedgerProtocolTransitionMap(), {
      wrapper: wrapperFor("testnet")
    });

    await act(async () => {
      await result.current.submit({ startLedger: "1000", count: "4" });
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
