import { beforeEach, describe, expect, it } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { useLedgerLookup } from "@/features/ledger-lookup/hooks/useLedgerLookup";
import { handlers } from "@/features/ledger-lookup/msw/handlers";
import {
  futureSequence,
  missingSequence,
  sampleSequence
} from "@/features/ledger-lookup/fixtures/ledgerLookup.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useLedgerLookup", () => {
  beforeEach(() => {
    resetHorizonClients();
  });

  it("starts in idle state", () => {
    const { result } = renderHook(() => useLedgerLookup(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("reports an error for empty input", async () => {
    const { result } = renderHook(() => useLedgerLookup(), { wrapper });
    await act(async () => {
      await result.current.submit("");
    });
    await waitFor(() => {
      expect(result.current.state).toEqual({
        status: "error",
        code: "empty_input"
      });
    });
  });

  it("reports an error for invalid non-numeric sequence", async () => {
    const { result } = renderHook(() => useLedgerLookup(), { wrapper });
    await act(async () => {
      await result.current.submit("invalid-seq");
    });
    await waitFor(() => {
      expect(result.current.state).toEqual({
        status: "error",
        code: "invalid_sequence"
      });
    });
  });

  it("resolves valid sequence and updates state to success", async () => {
    const { result } = renderHook(() => useLedgerLookup(), { wrapper });
    await act(async () => {
      await result.current.submit(String(sampleSequence));
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe("success");
    });

    if (result.current.state.status === "success") {
      expect(result.current.state.ledger.sequence).toBe(sampleSequence);
      expect(result.current.state.ledger.successfulTransactionCount).toBe(125);
      expect(result.current.state.ledger.failedTransactionCount).toBe(3);
    }
  });

  it("reports future_ledger with currentHeight when sequence is in the future", async () => {
    const { result } = renderHook(() => useLedgerLookup(), { wrapper });
    await act(async () => {
      await result.current.submit(String(futureSequence));
    });

    await waitFor(() => {
      expect(result.current.state).toEqual({
        status: "error",
        code: "future_ledger",
        detail: { currentHeight: sampleSequence }
      });
    });
  });

  it("reports ledger_not_found for missing ledger", async () => {
    const { result } = renderHook(() => useLedgerLookup(), { wrapper });
    await act(async () => {
      await result.current.submit(String(missingSequence));
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe("error");
      if (result.current.state.status === "error") {
        expect(result.current.state.code).toBe("ledger_not_found");
      }
    });
  });

  it("resets state back to idle", async () => {
    const { result } = renderHook(() => useLedgerLookup(), { wrapper });
    await act(async () => {
      await result.current.submit(String(sampleSequence));
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => {
      result.current.reset();
    });
    expect(result.current.state.status).toBe("idle");
  });
});
