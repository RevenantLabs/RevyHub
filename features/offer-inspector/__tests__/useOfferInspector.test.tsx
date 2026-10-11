import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { useOfferInspector } from "@/features/offer-inspector/hooks/useOfferInspector";
import { handlers } from "@/features/offer-inspector/msw/handlers";
import {
  accountId,
  unknownAccountId
} from "@/features/offer-inspector/fixtures/offerInspector.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useOfferInspector", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useOfferInspector(), { wrapper });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("loads open offers for a valid account", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useOfferInspector(), { wrapper });

    await act(async () => {
      await result.current.submit(accountId);
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    expect(result.current.state).toMatchObject({
      status: "success",
      result: {
        offers: expect.any(Array),
        grossReserveUnits: 2
      }
    });
  });

  it("rejects an invalid address before making any network request", async () => {
    const { result } = renderHook(() => useOfferInspector(), { wrapper });

    await act(async () => {
      await result.current.submit("not-an-address");
    });

    expect(result.current.state).toEqual({ status: "error", code: "invalid_address" });
  });

  it("rejects a secret seed starting with S before any network request", async () => {
    const { result } = renderHook(() => useOfferInspector(), { wrapper });

    await act(async () => {
      await result.current.submit("S".repeat(56));
    });

    expect(result.current.state).toEqual({ status: "error", code: "invalid_address" });
  });

  it("reports a missing account", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useOfferInspector(), { wrapper });

    await act(async () => {
      await result.current.submit(unknownAccountId);
    });

    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", code: "account_not_found" })
    );
  });

  it("clears result on reset", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useOfferInspector(), { wrapper });

    await act(async () => {
      await result.current.submit(accountId);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});

