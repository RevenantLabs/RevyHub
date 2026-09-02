import { describe, expect, it } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { useContractStorage } from "@/features/contract-storage/hooks/useContractStorage";
import { handlers } from "@/features/contract-storage/msw/handlers";
import {
  contractId,
  unknownContractId
} from "@/features/contract-storage/fixtures/contractStorage.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useContractStorage", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useContractStorage(), { wrapper });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("loads storage for a valid contract", async () => {
    const { result } = renderHook(() => useContractStorage(), { wrapper });

    await act(async () => {
      await result.current.submit(contractId);
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    expect(result.current.state).toMatchObject({
      result: { contractId, entries: expect.any(Array) }
    });
  });

  it("rejects an invalid contract ID before making a request", async () => {
    const { result } = renderHook(() => useContractStorage(), { wrapper });

    await act(async () => {
      await result.current.submit("not-a-contract");
    });

    expect(result.current.state).toEqual({ status: "error", code: "invalid_contract_id" });
  });

  it("reports a missing contract", async () => {
    const { result } = renderHook(() => useContractStorage(), { wrapper });

    await act(async () => {
      await result.current.submit(unknownContractId);
    });

    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", code: "contract_not_found" })
    );
  });

  it("clears the result on reset", async () => {
    const { result } = renderHook(() => useContractStorage(), { wrapper });

    await act(async () => {
      await result.current.submit(contractId);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
