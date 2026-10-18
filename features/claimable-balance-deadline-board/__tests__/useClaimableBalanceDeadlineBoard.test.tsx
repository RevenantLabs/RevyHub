import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider, useNetwork } from "@/core/network/NetworkProvider";
import { withMswHandlers, http, HttpResponse, delay } from "@/core/testing/msw";
import { useClaimableBalanceDeadlineBoard } from "../hooks/useClaimableBalanceDeadlineBoard";
import { claimant, normalPage } from "../fixtures/claimableBalanceDeadlineBoard.fixture";
import { handlers } from "../msw/handlers";
const server = withMswHandlers(...handlers);
const wrapper = ({ children }: { children: React.ReactNode }) => <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
describe("board state", () => {
  it("starts idle, rejects secret input, and never stores it", async () => {
    const { result } = renderHook(() => useClaimableBalanceDeadlineBoard(), { wrapper });
    expect(result.current.state.status).toBe("idle");
    await act(async () => { await result.current.submit({ claimant: "S" + "x".repeat(55) }); });
    expect(result.current.state).toEqual({ status: "error", code: "invalid_claimant", field: "claimant" });
    expect(JSON.stringify(result.current.state)).not.toContain("Sxxx");
  });
  it("enters loading while Horizon responds", async () => {
    server.use(http.get("https://horizon-testnet.stellar.org/claimable_balances", async () => {
      await delay(100);
      return HttpResponse.json(normalPage);
    }));
    const { result } = renderHook(() => useClaimableBalanceDeadlineBoard(), { wrapper });
    let pending: Promise<void> | undefined;
    act(() => { pending = result.current.submit({ claimant }); });
    expect(result.current.state.status).toBe("loading");
    await act(async () => { await pending; });
    expect(result.current.state.status).toBe("success");
  });
  it("loads and clears stale data when network changes", async () => {
    const { result } = renderHook(() => ({ board: useClaimableBalanceDeadlineBoard(), network: useNetwork() }), { wrapper });
    await act(async () => { await result.current.board.submit({ claimant }); });
    await waitFor(() => expect(result.current.board.state.status).toBe("success"));
    act(() => result.current.network.setNetwork("mainnet"));
    expect(result.current.board.state.status).toBe("idle");
  });
});
