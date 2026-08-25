import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { useTrustlineChecker } from "@/features/trustline-checker/hooks/useTrustlineChecker";
import { handlers } from "@/features/trustline-checker/msw/handlers";
import {
  accountId,
  issuerId
} from "@/features/trustline-checker/fixtures/trustlineChecker.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

const valid = { accountId, assetCode: "USDC", issuerId };

describe("useTrustlineChecker", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useTrustlineChecker(), { wrapper });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("finds an existing trustline", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useTrustlineChecker(), { wrapper });

    await act(async () => {
      await result.current.submit(valid);
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });

  it("attaches the offending field to a validation error", async () => {
    const { result } = renderHook(() => useTrustlineChecker(), { wrapper });

    await act(async () => {
      await result.current.submit({ ...valid, assetCode: "!!!" });
    });

    expect(result.current.state).toEqual({
      status: "error",
      code: "invalid_asset_code",
      field: "assetCode"
    });
  });

  it("does not attach a field to a transport error", async () => {
    const { result } = renderHook(() => useTrustlineChecker(), { wrapper });

    await act(async () => {
      await result.current.submit({ ...valid, accountId: "bad" });
    });

    expect(result.current.state).toMatchObject({ code: "invalid_account", field: "accountId" });
  });

  it("clears state on reset", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useTrustlineChecker(), { wrapper });

    await act(async () => {
      await result.current.submit(valid);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
