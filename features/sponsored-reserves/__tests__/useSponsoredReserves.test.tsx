import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { useSponsoredReserves } from "@/features/sponsored-reserves/hooks/useSponsoredReserves";
import {
  handlers,
  slowAccountHandler
} from "@/features/sponsored-reserves/msw/handlers";
import {
  accountId,
  secretSeed,
  unknownAccountId
} from "@/features/sponsored-reserves/fixtures/sponsoredReserves.fixture";

const server = withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useSponsoredReserves", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useSponsoredReserves(), { wrapper });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("transitions through loading to success", async () => {
    server.use(slowAccountHandler);
    const { result } = renderHook(() => useSponsoredReserves(), { wrapper });
    let request = Promise.resolve();

    act(() => {
      request = result.current.submit(accountId);
    });
    expect(result.current.state).toEqual({ status: "loading" });

    await act(async () => {
      await request;
    });
    expect(result.current.state).toMatchObject({
      status: "success",
      data: { sponsoredEntries: expect.any(Array) }
    });
  });

  it("rejects invalid input before making a request", async () => {
    const { result } = renderHook(() => useSponsoredReserves(), { wrapper });

    await act(async () => {
      await result.current.submit("not-an-address");
    });

    expect(result.current.state).toEqual({ status: "error", code: "invalid_address" });
  });

  it("never carries a secret seed into hook state", async () => {
    const { result } = renderHook(() => useSponsoredReserves(), { wrapper });

    await act(async () => {
      await result.current.submit(secretSeed);
    });

    expect(result.current.state).toEqual({ status: "error", code: "invalid_address" });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
  });

  it("reports a missing account", async () => {
    const { result } = renderHook(() => useSponsoredReserves(), { wrapper });

    await act(async () => {
      await result.current.submit(unknownAccountId);
    });

    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", code: "account_not_found" })
    );
  });

  it("clears a result on reset", async () => {
    const { result } = renderHook(() => useSponsoredReserves(), { wrapper });

    await act(async () => {
      await result.current.submit(accountId);
    });
    expect(result.current.state.status).toBe("success");

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
