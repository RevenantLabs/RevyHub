import { describe, expect, it } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { useTransactionTimeboundPlanner } from "@/features/transaction-timebound-planner/hooks/useTransactionTimeboundPlanner";

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useTransactionTimeboundPlanner", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useTransactionTimeboundPlanner(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("reports an error for empty input", async () => {
    const { result } = renderHook(() => useTransactionTimeboundPlanner(), { wrapper });
    await act(async () => {
      await result.current.submit("");
    });
    await waitFor(() => expect(result.current.state.status).toBe("error"));
  });
});
