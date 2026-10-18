import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { useBalanceViewer } from "@/features/balance-viewer/hooks/useBalanceViewer";
import { handlers } from "@/features/balance-viewer/msw/handlers";
import {
  accountId,
  unknownAccountId
} from "@/features/balance-viewer/fixtures/balanceViewer.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useBalanceViewer", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useBalanceViewer(), { wrapper });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("loads balances for a funded account", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useBalanceViewer(), { wrapper });

    await act(async () => {
      await result.current.submit(accountId);
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    expect(result.current.state).toMatchObject({ data: { balances: expect.any(Array) } });
  });

  it("rejects an invalid address before making a request", async () => {
    const { result } = renderHook(() => useBalanceViewer(), { wrapper });

    await act(async () => {
      await result.current.submit("not-an-address");
    });

    expect(result.current.state).toEqual({ status: "error", code: "invalid_address" });
  });

  it("reports a missing account", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useBalanceViewer(), { wrapper });

    await act(async () => {
      await result.current.submit(unknownAccountId);
    });

    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", code: "account_not_found" })
    );
  });

  it("clears the result on reset", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useBalanceViewer(), { wrapper });

    await act(async () => {
      await result.current.submit(accountId);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
