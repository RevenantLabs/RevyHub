import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { useTransactionLookup } from "@/features/transaction-lookup/hooks/useTransactionLookup";
import { handlers } from "@/features/transaction-lookup/msw/handlers";
import {
  missingHash,
  successfulHash
} from "@/features/transaction-lookup/fixtures/transactionLookup.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useTransactionLookup", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useTransactionLookup(), { wrapper });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("loads a transaction", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useTransactionLookup(), { wrapper });

    await act(async () => {
      await result.current.submit(successfulHash);
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });

  it("rejects a malformed hash without a request", async () => {
    const { result } = renderHook(() => useTransactionLookup(), { wrapper });

    await act(async () => {
      await result.current.submit("not-a-hash");
    });

    expect(result.current.state).toEqual({ status: "error", code: "invalid_hash" });
  });

  it("reports a hash that does not exist", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useTransactionLookup(), { wrapper });

    await act(async () => {
      await result.current.submit(missingHash);
    });

    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", code: "not_found" })
    );
  });

  it("clears state on reset", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useTransactionLookup(), { wrapper });

    await act(async () => {
      await result.current.submit(successfulHash);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
