import { describe, expect, it } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { useSequenceInspector } from "@/features/sequence-inspector/hooks/useSequenceInspector";
import { handlers } from "@/features/sequence-inspector/msw/handlers";
import {
  accountId,
  currentSequence,
  missingAccountId,
  secretSeed
} from "@/features/sequence-inspector/fixtures/sequenceInspector.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useSequenceInspector", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useSequenceInspector(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("reports an error for empty input", async () => {
    const { result } = renderHook(() => useSequenceInspector(), { wrapper });
    await act(async () => {
      await result.current.submit({ accountId: "" });
    });
    expect(result.current.state).toEqual({ status: "error", code: "empty_input" });
  });

  it("moves through loading to an exact successful result", async () => {
    const { result } = renderHook(() => useSequenceInspector(), { wrapper });
    let request!: Promise<void>;

    act(() => {
      request = result.current.submit({ accountId });
    });
    expect(result.current.state.status).toBe("loading");

    await act(async () => request);
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    expect(result.current.state.status === "success" && result.current.state.result.currentSequence)
      .toBe(currentSequence);
  });

  it("returns an actionable not-found state", async () => {
    const { result } = renderHook(() => useSequenceInspector(), { wrapper });
    await act(async () => {
      await result.current.submit({ accountId: missingAccountId });
    });
    expect(result.current.state).toEqual({ status: "error", code: "account_not_found" });
  });

  it("never carries a submitted secret seed into hook state", async () => {
    const { result } = renderHook(() => useSequenceInspector(), { wrapper });
    await act(async () => {
      await result.current.submit({ accountId: secretSeed });
    });
    expect(result.current.state).toEqual({ status: "error", code: "invalid_address" });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
  });

  it("returns to idle when reset", async () => {
    const { result } = renderHook(() => useSequenceInspector(), { wrapper });
    await act(async () => {
      await result.current.submit({ accountId });
    });
    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
