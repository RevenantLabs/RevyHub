import { describe, expect, it } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { useContractMetadataViewer } from "@/features/contract-metadata-viewer/hooks/useContractMetadataViewer";

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useContractMetadataViewer", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useContractMetadataViewer(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("reports invalid_contract_id for empty input", async () => {
    const { result } = renderHook(() => useContractMetadataViewer(), { wrapper });
    await act(async () => {
      await result.current.submit("");
    });
    await waitFor(() => expect(result.current.state.status).toBe("error"));
    expect(result.current.state).toEqual({ status: "error", code: "invalid_contract_id" });
  });
});
