import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NetworkProvider, useNetwork } from "@/core/network/NetworkProvider";
import { resetHorizonClients } from "@/core/horizon/client";
import { withMswHandlers } from "@/core/testing/msw";
import { useAccountSigners } from "@/features/account-signers/hooks/useAccountSigners";
import { handlers } from "@/features/account-signers/msw/handlers";
import {
  accountId,
  unknownAccountId
} from "@/features/account-signers/fixtures/accountSigners.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

function useAccountSignersWithNetwork() {
  return { ...useAccountSigners(), setNetwork: useNetwork().setNetwork };
}

describe("useAccountSigners", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useAccountSigners(), { wrapper });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("transitions through loading to success", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useAccountSigners(), { wrapper });

    let request: Promise<void>;
    act(() => {
      request = result.current.submit(accountId);
    });
    expect(result.current.state).toEqual({ status: "loading" });

    await act(async () => request);
    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });

  it("rejects invalid and secret-looking input without storing the value", async () => {
    const { result } = renderHook(() => useAccountSigners(), { wrapper });
    const secret = `S${"A".repeat(55)}`;

    await act(async () => result.current.submit(secret));

    expect(result.current.state).toEqual({ status: "error", code: "invalid_address" });
    expect(JSON.stringify(result.current.state)).not.toContain(secret);
  });

  it("reports a missing account", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useAccountSigners(), { wrapper });

    await act(async () => result.current.submit(unknownAccountId));

    expect(result.current.state).toEqual({ status: "error", code: "account_not_found" });
  });

  it("clears the result on reset", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useAccountSigners(), { wrapper });

    await act(async () => result.current.submit(accountId));
    expect(result.current.state.status).toBe("success");

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("derives a testnet result away after a network switch", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useAccountSignersWithNetwork(), { wrapper });

    await act(async () => result.current.submit(accountId));
    expect(result.current.state.status).toBe("success");

    act(() => result.current.setNetwork("mainnet"));
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
