import { describe, expect, it } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { useContractEvents } from "@/features/contract-events/hooks/useContractEvents";
import { handlers } from "@/features/contract-events/msw/handlers";
import {
  contractId,
  endLedger,
  startLedger,
  unknownContractId
} from "@/features/contract-events/fixtures/contractEvents.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useContractEvents", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useContractEvents(), { wrapper });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("loads events for a valid contract and range", async () => {
    const { result } = renderHook(() => useContractEvents(), { wrapper });

    await act(async () => {
      await result.current.submit({
        contractId,
        startLedger: String(startLedger),
        endLedger: String(endLedger)
      });
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    expect(result.current.state).toMatchObject({
      result: { contractId, events: expect.any(Array) }
    });
  });

  it("rejects an invalid contract ID before making a request", async () => {
    const { result } = renderHook(() => useContractEvents(), { wrapper });

    await act(async () => {
      await result.current.submit({
        contractId: "not-a-contract",
        startLedger: "100",
        endLedger: "200"
      });
    });

    expect(result.current.state).toEqual({
      status: "error",
      code: "invalid_contract_id"
    });
  });

  it("reports no events for a contract that emitted none", async () => {
    const { result } = renderHook(() => useContractEvents(), { wrapper });

    await act(async () => {
      await result.current.submit({
        contractId: unknownContractId,
        startLedger: String(startLedger),
        endLedger: String(endLedger)
      });
    });

    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", code: "no_events" })
    );
  });

  it("clears the result on reset", async () => {
    const { result } = renderHook(() => useContractEvents(), { wrapper });

    await act(async () => {
      await result.current.submit({
        contractId,
        startLedger: String(startLedger),
        endLedger: String(endLedger)
      });
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
