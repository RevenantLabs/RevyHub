import { describe, expect, it } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { resetHorizonClients } from "@/core/horizon/client";
import { withMswHandlers } from "@/core/testing/msw";
import { useAccountDataEntries } from "@/features/account-data-entries/hooks/useAccountDataEntries";
import { handlers } from "@/features/account-data-entries/msw/handlers";
import {
  accountId,
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
    expect(result.current.state.status).toBe("idle");
  });

  it("reports an error for empty input", async () => {
    const { result } = renderHook(() => useAccountDataEntries(), { wrapper });
    await act(async () => {
      await result.current.submit("");
    });
    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", code: "empty_input" })
    );
  });

  it("loads and decodes account data", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useAccountDataEntries(), { wrapper });

    await act(async () => {
      await result.current.submit(accountId);
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    expect(result.current.state).toMatchObject({ data: { entries: expect.any(Array) } });
  });

  it("reports an account that does not exist", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useAccountDataEntries(), { wrapper });

    await act(async () => {
      await result.current.submit(unknownAccountId);
    });

    expect(result.current.state).toEqual({ status: "error", code: "account_not_found" });
  });

  it("never keeps a submitted secret in hook state", async () => {
    const { result } = renderHook(() => useAccountDataEntries(), { wrapper });

    await act(async () => {
      await result.current.submit(secretSeed);
    });

    expect(result.current.state).toEqual({ status: "error", code: "invalid_address" });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
  });

  it("returns to idle when reset", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useAccountDataEntries(), { wrapper });

    await act(async () => {
      await result.current.submit(accountId);
    });
    act(() => result.current.reset());

    expect(result.current.state).toEqual({ status: "idle" });
  });
});
