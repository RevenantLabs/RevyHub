import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { useSequenceInspector } from "@/features/sequence-inspector/hooks/useSequenceInspector";
import { handlers } from "@/features/sequence-inspector/msw/handlers";
import { accountId, missingAccountId } from "@/features/sequence-inspector/fixtures/sequenceInspector.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useSequenceInspector", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useSequenceInspector(), { wrapper });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("loads a sequence", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useSequenceInspector(), { wrapper });

    await act(async () => {
      await result.current.submit(accountId);
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });

  it("rejects an invalid account id without a request", async () => {
    const { result } = renderHook(() => useSequenceInspector(), { wrapper });

    await act(async () => {
      await result.current.submit("not-an-account");
    });

    expect(result.current.state).toEqual({ status: "error", code: "invalid_address" });
  });

  it("reports an account that does not exist", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useSequenceInspector(), { wrapper });

    await act(async () => {
      await result.current.submit(missingAccountId);
    });

    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", code: "account_not_found" })
    );
  });

  it("clears state on reset", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useSequenceInspector(), { wrapper });

    await act(async () => {
      await result.current.submit(accountId);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
