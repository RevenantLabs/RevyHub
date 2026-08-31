import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { withMswHandlers } from "@/core/testing/msw";
import { useTestnetFaucet } from "@/features/testnet-faucet/hooks/useTestnetFaucet";
import { handlers } from "@/features/testnet-faucet/msw/handlers";
import {
  fundedAccountId,
  newAccountId,
  secretSeed
} from "@/features/testnet-faucet/fixtures/testnetFaucet.fixture";

withMswHandlers(...handlers);

describe("useTestnetFaucet", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useTestnetFaucet());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("reports a successful funding", async () => {
    const { result } = renderHook(() => useTestnetFaucet());

    await act(async () => {
      await result.current.submit(newAccountId);
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });

  it("reports an account that already exists", async () => {
    const { result } = renderHook(() => useTestnetFaucet());

    await act(async () => {
      await result.current.submit(fundedAccountId);
    });

    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", code: "already_funded" })
    );
  });

  it("rejects a secret seed before any request", async () => {
    const { result } = renderHook(() => useTestnetFaucet());

    await act(async () => {
      await result.current.submit(secretSeed);
    });

    expect(result.current.state).toEqual({ status: "error", code: "invalid_address" });
  });

  it("clears state on reset", async () => {
    const { result } = renderHook(() => useTestnetFaucet());

    await act(async () => {
      await result.current.submit(newAccountId);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
