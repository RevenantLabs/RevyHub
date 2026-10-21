import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider, useNetwork } from "@/core/network/NetworkProvider";
import { resetHorizonClients } from "@/core/horizon/client";
import { withMswHandlers } from "@/core/testing/msw";
import { useOperationResultXdrDecoder } from "../hooks/useOperationResultXdrDecoder";
import { handlers } from "../msw/handlers";
import { successHash, missingHash } from "../fixtures/operationResultXdrDecoder.fixture";
withMswHandlers(...handlers);
function wrapper({ children }: { children: React.ReactNode }) { return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>; }
describe("decoder state", () => {
  it("moves from idle through loading to success", async () => { resetHorizonClients(); const { result } = renderHook(() => useOperationResultXdrDecoder(), { wrapper }); expect(result.current.state.status).toBe("idle"); let pending!: Promise<void>; act(() => { pending = result.current.submit(successHash); }); expect(result.current.state.status).toBe("loading"); await act(async () => { await pending; }); expect(result.current.state.status).toBe("success"); });
  it("rejects invalid input and reports missing transactions", async () => { resetHorizonClients(); const { result } = renderHook(() => useOperationResultXdrDecoder(), { wrapper }); await act(async () => { await result.current.submit("S".repeat(56)); }); expect(result.current.state).toEqual({ status: "error", code: "invalid_hash" }); await act(async () => { await result.current.submit(missingHash); }); expect(result.current.state).toEqual({ status: "error", code: "transaction_not_found" }); });
  it("derives stale network results away", async () => { resetHorizonClients(); const { result } = renderHook(() => ({ decoder: useOperationResultXdrDecoder(), network: useNetwork() }), { wrapper }); await act(async () => { await result.current.decoder.submit(successHash); }); await waitFor(() => expect(result.current.decoder.state.status).toBe("success")); act(() => result.current.network.setNetwork("mainnet")); expect(result.current.decoder.state.status).toBe("idle"); });
});
