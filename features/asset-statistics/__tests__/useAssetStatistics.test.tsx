import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, beforeAll, afterEach, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { handlers } from "@/features/asset-statistics/msw/handlers";
import { useAssetStatistics } from "@/features/asset-statistics/hooks/useAssetStatistics";

const server = setupServer(...handlers);
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("useAssetStatistics", () => {
  it("starts in idle state", () => {
    const { result } = renderHook(() => useAssetStatistics(), {
      wrapper: NetworkProvider
    });
    expect(result.current.state.status).toBe("idle");
  });

  it("transitions to loading then success", async () => {
    const { result } = renderHook(() => useAssetStatistics(), {
      wrapper: NetworkProvider
    });

    act(() => {
      result.current.submit({ assetCode: "USDC", issuerId: "GBBD47IF6LWK7P7MDEVSCWTTCJM4NUIQ35M4MPMHEUEH9DMB2UCA36GZ" });
    });

    expect(result.current.state.status).toBe("loading");

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.result.assetCode).toBe("USDC");
    }
  });

  it("transitions to error on bad input", async () => {
    const { result } = renderHook(() => useAssetStatistics(), {
      wrapper: NetworkProvider
    });

    act(() => {
      result.current.submit({ assetCode: "", issuerId: "" });
    });

    expect(result.current.state.status).toBe("error");
    if (result.current.state.status === "error") {
      expect(result.current.state.code).toBe("empty_asset_code");
    }
  });
});
