import { describe, expect, it } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { useAssetFlagsInspector } from "@/features/asset-flags-inspector/hooks/useAssetFlagsInspector";
import { handlers } from "@/features/asset-flags-inspector/msw/handlers";
import { issuerId } from "@/features/asset-flags-inspector/fixtures/assetFlagsInspector.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useAssetFlagsInspector", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useAssetFlagsInspector(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("reports an error for empty input", async () => {
    const { result } = renderHook(() => useAssetFlagsInspector(), { wrapper });
    await act(async () => {
      await result.current.submit("");
    });
    await waitFor(() => expect(result.current.state.status).toBe("error"));
    if (result.current.state.status === "error") {
      expect(result.current.state.code).toBe("empty_input");
    }
  });

  it("loads issuer flags on success", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useAssetFlagsInspector(), { wrapper });

    await act(async () => {
      await result.current.submit(issuerId);
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    if (result.current.state.status === "success") {
      expect(result.current.state.result.issuerId).toBe(issuerId);
    }
  });
});
