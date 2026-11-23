import { act, renderHook, waitFor } from "@testing-library/react";
import { Keypair } from "@stellar/stellar-sdk";
import { describe, expect, it, vi } from "vitest";
import { useAccountMergeValueReconciler } from "../hooks/useAccountMergeValueReconciler";
import { normalInput } from "../fixtures/normal.fixture";
import { feeBumpInput } from "../fixtures/boundary.fixture";

describe("local processing state", () => {
  it("moves through loading, success, reset and error", async () => {
    const { result } = renderHook(() => useAccountMergeValueReconciler());
    expect(result.current.state.status).toBe("idle");
    act(() => result.current.submit(normalInput));
    expect(result.current.state.status).toBe("loading");
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    act(() => result.current.reset());
    expect(result.current.state.status).toBe("idle");
    act(() => result.current.submit({ ...normalInput, envelope: "bad" }));
    expect(result.current.state).toEqual({ status: "error", code: "invalid_input" });
  });

  it("surfaces decode failures after the loading state", async () => {
    const { result } = renderHook(() => useAccountMergeValueReconciler());
    act(() => result.current.submit({ ...normalInput, resultXdr: "AAAAAAAAAAA=" }));
    expect(result.current.state.status).toBe("loading");
    await waitFor(() => expect(result.current.state).toEqual({ status: "error", code: "malformed_data" }));
  });

  it("cancels an obsolete local result on reset", async () => {
    const { result } = renderHook(() => useAccountMergeValueReconciler());
    act(() => { result.current.submit(normalInput); result.current.reset(); });
    await act(async () => { await Promise.resolve(); });
    expect(result.current.state.status).toBe("idle");
  });

  it("keeps only the latest of two overlapping submissions", async () => {
    const { result } = renderHook(() => useAccountMergeValueReconciler());
    act(() => { result.current.submit(normalInput); result.current.submit(feeBumpInput); });
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    const state = result.current.state;
    expect(state.status === "success" && state.result.envelopeKind).toBe("fee-bump");
  });

  it("clears the form after a pasted secret seed and never logs it", () => {
    const log = vi.spyOn(console, "log");
    const error = vi.spyOn(console, "error");
    const secret = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 9)).secret();
    const { result } = renderHook(() => useAccountMergeValueReconciler());
    act(() => result.current.submit({ ...normalInput, envelope: secret }));
    expect(result.current.redactions).toBe(1);
    expect(result.current.state).toEqual({ status: "error", code: "invalid_input" });
    expect([...log.mock.calls, ...error.mock.calls].flat().join(" ")).not.toContain(secret);
    log.mockRestore();
    error.mockRestore();
  });
});
