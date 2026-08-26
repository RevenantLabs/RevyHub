import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { useSponsoredReserves } from "@/features/sponsored-reserves/hooks/useSponsoredReserves";
import { accountId } from "@/features/sponsored-reserves/fixtures/sponsoredReserves.fixture";
import { resetHorizonClients } from "@/core/horizon/client";

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider>{children}</NetworkProvider>;
}

describe("useSponsoredReserves", () => {
  it("transitions from idle to success", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useSponsoredReserves(), { wrapper });

    expect(result.current.state.status).toBe("idle");

    await act(async () => {
      await result.current.submit(accountId);
    });

    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.data.accountId).toBe(accountId);
    }
  });

  it("transitions to error on bad input", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useSponsoredReserves(), { wrapper });

    await act(async () => {
      await result.current.submit("invalid");
    });

    expect(result.current.state.status).toBe("error");
  });
});
