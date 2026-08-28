import { describe, expect, it } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { NetworkProvider, useNetwork } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { useAccountMergePreflight } from "@/features/account-merge-preflight/hooks/useAccountMergePreflight";
import { handlers } from "@/features/account-merge-preflight/msw/handlers";
import {
  destinationAccountId,
  secretSeed,
  sourceAccountId,
  unknownDestinationAccountId,
  unknownSourceAccountId
} from "@/features/account-merge-preflight/fixtures/accountMergePreflight.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useAccountMergePreflight", () => {
  const valid = { sourceAccountId, destinationAccountId };

  it("starts idle", () => {
    const { result } = renderHook(() => useAccountMergePreflight(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("reports an error for empty input", async () => {
    const { result } = renderHook(() => useAccountMergePreflight(), { wrapper });
    await act(async () => {
      await result.current.submit({ sourceAccountId: "", destinationAccountId: "" });
    });
    expect(result.current.state).toEqual({
      status: "error",
      code: "empty_source",
      field: "sourceAccountId"
    });
  });

  it("moves through loading to a mergeable result", async () => {
    const { result } = renderHook(() => useAccountMergePreflight(), { wrapper });
    let request!: Promise<void>;
    act(() => {
      request = result.current.submit(valid);
    });
    expect(result.current.state.status).toBe("loading");
    await act(async () => request);
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    expect(result.current.state.status === "success" && result.current.state.result.mergeable)
      .toBe(true);
  });

  it("attaches source and destination lookup errors to different fields", async () => {
    const { result } = renderHook(() => useAccountMergePreflight(), { wrapper });
    await act(async () => {
      await result.current.submit({ ...valid, sourceAccountId: unknownSourceAccountId });
    });
    expect(result.current.state).toEqual({
      status: "error",
      code: "source_not_found",
      field: "sourceAccountId"
    });

    await act(async () => {
      await result.current.submit({
        ...valid,
        destinationAccountId: unknownDestinationAccountId
      });
    });
    expect(result.current.state).toEqual({
      status: "error",
      code: "destination_not_found",
      field: "destinationAccountId"
    });
  });

  it("never stores either submitted secret seed", async () => {
    const { result } = renderHook(() => useAccountMergePreflight(), { wrapper });
    await act(async () => {
      await result.current.submit({ sourceAccountId: secretSeed, destinationAccountId });
    });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
    expect(result.current.state).toMatchObject({ code: "invalid_source" });
  });

  it("derives a previous-network result back to idle", async () => {
    const { result } = renderHook(
      () => ({ preflight: useAccountMergePreflight(), network: useNetwork() }),
      { wrapper }
    );
    await act(async () => {
      await result.current.preflight.submit(valid);
    });
    expect(result.current.preflight.state.status).toBe("success");
    act(() => result.current.network.setNetwork("mainnet"));
    expect(result.current.preflight.state).toEqual({ status: "idle" });
  });

  it("aborts work and returns to idle on reset", async () => {
    const { result } = renderHook(() => useAccountMergePreflight(), { wrapper });
    await act(async () => {
      await result.current.submit(valid);
    });
    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
