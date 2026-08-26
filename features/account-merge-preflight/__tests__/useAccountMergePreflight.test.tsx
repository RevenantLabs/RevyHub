import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAccountMergePreflight } from "@/features/account-merge-preflight/hooks/useAccountMergePreflight";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { sourceId, destinationId } from "@/features/account-merge-preflight/fixtures/account-merge-preflight.fixture";
import { resetHorizonClients } from "@/core/horizon/client";
import { withMswHandlers } from "@/core/testing/msw";
import { handlers } from "@/features/account-merge-preflight/msw/handlers";

withMswHandlers(...handlers);

describe("useAccountMergePreflight", () => {
  it("transitions from idle to success", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useAccountMergePreflight(), {
      wrapper: ({ children }) => <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>
    });

    expect(result.current.state.status).toBe("idle");

    act(() => {
      result.current.submit(sourceId, destinationId);
    });

    expect(result.current.state.status).toBe("loading");

    await waitFor(() => {
      expect(result.current.state.status).toBe("success");
    });

    expect((result.current.state.status === "success" && result.current.state.result.isMergeable)).toBe(true);
  });
});
