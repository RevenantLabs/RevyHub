import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { usePreconditionsExplainer } from "@/features/preconditions-explainer/hooks/usePreconditionsExplainer";
import {
  handlers,
  serverErrorHandler
} from "@/features/preconditions-explainer/msw/handlers";
import {
  expiredXdr,
  ledgerSnapshot,
  notBase64,
  openXdr,
  secretSeed,
  unconditionalXdr
} from "@/features/preconditions-explainer/fixtures/preconditionsExplainer.fixture";

const server = withMswHandlers(...handlers);

function wrapper({ children }: { children: ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("usePreconditionsExplainer", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => usePreconditionsExplainer(), { wrapper });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("reports an empty submission without touching the network", async () => {
    const { result } = renderHook(() => usePreconditionsExplainer(), { wrapper });
    await act(async () => {
      await result.current.submit("   ");
    });
    expect(result.current.state).toEqual({ status: "error", code: "empty_input" });
  });

  it("moves through loading to a success state", async () => {
    const { result } = renderHook(() => usePreconditionsExplainer(), { wrapper });
    let request!: Promise<void>;

    act(() => {
      request = result.current.submit(openXdr);
    });
    expect(result.current.state.status).toBe("loading");

    await act(async () => request);
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    if (result.current.state.status !== "success") throw new Error("expected success");
    expect(result.current.state.explanation.verdict).toBe("satisfiable");
    expect(result.current.state.explanation.ledger).toEqual(ledgerSnapshot);
  });

  it("keeps an expired transaction as a success with an expired verdict", async () => {
    const { result } = renderHook(() => usePreconditionsExplainer(), { wrapper });
    await act(async () => {
      await result.current.submit(expiredXdr);
    });

    if (result.current.state.status !== "success") throw new Error("expected success");
    expect(result.current.state.explanation.verdict).toBe("expired");
  });

  it("degrades rather than failing when the ledger cannot be fetched", async () => {
    server.use(serverErrorHandler);
    const { result } = renderHook(() => usePreconditionsExplainer(), { wrapper });

    await act(async () => {
      await result.current.submit(openXdr);
    });

    if (result.current.state.status !== "success") throw new Error("expected success");
    expect(result.current.state.explanation.degradedReason).toBe("request_failed");
    expect(result.current.state.explanation.timeBounds).not.toBeNull();
  });

  it("surfaces an envelope that declares nothing as no_preconditions", async () => {
    const { result } = renderHook(() => usePreconditionsExplainer(), { wrapper });
    await act(async () => {
      await result.current.submit(unconditionalXdr);
    });
    expect(result.current.state).toEqual({ status: "error", code: "no_preconditions" });
  });

  it("reports unusable input as invalid_xdr", async () => {
    const { result } = renderHook(() => usePreconditionsExplainer(), { wrapper });
    await act(async () => {
      await result.current.submit(notBase64);
    });
    expect(result.current.state).toEqual({ status: "error", code: "invalid_xdr" });
  });

  it("never carries a submitted secret seed into hook state", async () => {
    const { result } = renderHook(() => usePreconditionsExplainer(), { wrapper });
    await act(async () => {
      await result.current.submit(secretSeed);
    });

    expect(result.current.state).toEqual({ status: "error", code: "invalid_xdr" });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
  });

  it("returns to idle when reset", async () => {
    const { result } = renderHook(() => usePreconditionsExplainer(), { wrapper });
    await act(async () => {
      await result.current.submit(openXdr);
    });

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
