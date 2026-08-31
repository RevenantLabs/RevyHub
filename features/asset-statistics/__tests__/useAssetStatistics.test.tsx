import { describe, expect, it } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { useAssetStatistics } from "@/features/asset-statistics/hooks/useAssetStatistics";
import { handlers } from "@/features/asset-statistics/msw/handlers";
import {
  assetCode,
  issuerId,
  secretSeed,
  unknownAssetCode
} from "@/features/asset-statistics/fixtures/assetStatistics.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useAssetStatistics", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useAssetStatistics(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("reports an error for empty input", async () => {
    const { result } = renderHook(() => useAssetStatistics(), { wrapper });
    await act(async () => {
      await result.current.submit({ assetCode: "", issuerId: "" });
    });
    await waitFor(() =>
      expect(result.current.state).toEqual({
        status: "error",
        code: "empty_asset_code",
        field: "assetCode"
      })
    );
  });

  it("loads complete asset statistics", async () => {
    const { result } = renderHook(() => useAssetStatistics(), { wrapper });

    await act(async () => {
      await result.current.submit({ assetCode, issuerId });
    });

    expect(result.current.state).toMatchObject({
      status: "success",
      result: { circulatingSupply: "9007199254741176.0000000" }
    });
  });

  it("reports a missing code and issuer pair", async () => {
    const { result } = renderHook(() => useAssetStatistics(), { wrapper });

    await act(async () => {
      await result.current.submit({ assetCode: unknownAssetCode, issuerId });
    });

    expect(result.current.state).toEqual({
      status: "error",
      code: "asset_not_found",
      field: null
    });
  });

  it("never keeps a submitted secret seed in state", async () => {
    const { result } = renderHook(() => useAssetStatistics(), { wrapper });

    await act(async () => {
      await result.current.submit({ assetCode, issuerId: secretSeed });
    });

    expect(result.current.state).toEqual({
      status: "error",
      code: "invalid_issuer",
      field: "issuerId"
    });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
  });

  it("returns to idle when reset", async () => {
    const { result } = renderHook(() => useAssetStatistics(), { wrapper });

    await act(async () => {
      await result.current.submit({ assetCode, issuerId });
    });
    act(() => result.current.reset());

    expect(result.current.state).toEqual({ status: "idle" });
  });
});
