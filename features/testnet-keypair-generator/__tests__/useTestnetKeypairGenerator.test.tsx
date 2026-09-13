import { describe, expect, it } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { withMswHandlers } from "@/core/testing/msw";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { useTestnetKeypairGenerator } from "@/features/testnet-keypair-generator/hooks/useTestnetKeypairGenerator";
import { handlers } from "@/features/testnet-keypair-generator/msw/handlers";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useTestnetKeypairGenerator", () => {
  it("starts in idle state", () => {
    const { result } = renderHook(() => useTestnetKeypairGenerator(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("reports an error when a secret seed is passed", async () => {
    const { result } = renderHook(() => useTestnetKeypairGenerator(), { wrapper });
    await act(async () => {
      await result.current.submit("SBZ2O7LMWTY3X3T32SZZK52F4E7U6W23EOGQOES52Z5H7R774H7NVRN2");
    });
    await waitFor(() => {
      expect(result.current.state.status).toBe("error");
      if (result.current.state.status === "error") {
        expect(result.current.state.code).toBe("secret_input_prohibited");
      }
    });
  });

  it("successfully generates a keypair", async () => {
    const { result } = renderHook(() => useTestnetKeypairGenerator(), { wrapper });
    await act(async () => {
      await result.current.submit("Test Wallet", false);
    });
    await waitFor(() => {
      expect(result.current.state.status).toBe("success");
      if (result.current.state.status === "success") {
        expect(result.current.state.result.publicKey).toMatch(/^G[A-Z2-7]{55}$/);
        expect(result.current.state.result.label).toBe("Test Wallet");
      }
    });
  });

  it("can reset back to idle", async () => {
    const { result } = renderHook(() => useTestnetKeypairGenerator(), { wrapper });
    await act(async () => {
      await result.current.submit("", false);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => {
      result.current.reset();
    });
    expect(result.current.state.status).toBe("idle");
  });
});
