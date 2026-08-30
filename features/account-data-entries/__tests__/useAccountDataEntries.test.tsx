import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { resetHorizonClients } from "@/core/horizon/client";
import { withMswHandlers } from "@/core/testing/msw";
import { useAccountDataEntries } from "@/features/account-data-entries/hooks/useAccountDataEntries";
import { handlers } from "@/features/account-data-entries/msw/handlers";
import {
  accountId,
  emptyAccountId,
  secretSeed,
  unknownAccountId
} from "@/features/account-data-entries/fixtures/accountDataEntries.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useAccountDataEntries", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useAccountDataEntries(), { wrapper });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("loads data entries for a funded account", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useAccountDataEntries(), { wrapper });

    await act(async () => {
      await result.current.submit(accountId);
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    expect(result.current.state).toMatchObject({
      result: { accountId, entries: expect.any(Array) }
    });
  });

  it("returns an empty result for an account with no data", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useAccountDataEntries(), { wrapper });

    await act(async () => {
      await result.current.submit(emptyAccountId);
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    if (result.current.state.status !== "success") return;
    expect(result.current.state.result.entries).toHaveLength(0);
  });

  it("rejects a secret seed before making a request", async () => {
    const { result } = renderHook(() => useAccountDataEntries(), { wrapper });

    await act(async () => {
      await result.current.submit(secretSeed);
    });

    expect(result.current.state).toEqual({ status: "error", code: "invalid_address" });
  });

  it("reports a missing account", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useAccountDataEntries(), { wrapper });

    await act(async () => {
      await result.current.submit(unknownAccountId);
    });

    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", code: "account_not_found" })
    );
  });

  it("clears the result on reset", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useAccountDataEntries(), { wrapper });

    await act(async () => {
      await result.current.submit(accountId);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
