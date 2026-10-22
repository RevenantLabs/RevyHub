import { describe, expect, it } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { useBatchOperationSummary } from "@/features/batch-operation-summary/hooks/useBatchOperationSummary";

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useBatchOperationSummary", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useBatchOperationSummary(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("reports the explicit empty-XDR error", async () => {
    const { result } = renderHook(() => useBatchOperationSummary(), { wrapper });
    await act(async () => {
      await result.current.submit("");
    });
    await waitFor(() => expect(result.current.state.status).toBe("error"));
    expect(result.current.state).toEqual({ status: "error", code: "empty_xdr" });
  });
});
