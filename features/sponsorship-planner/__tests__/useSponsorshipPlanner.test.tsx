import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { useSponsorshipPlanner } from "@/features/sponsorship-planner/hooks/useSponsorshipPlanner";
import { handlers, slowSponsorHandler } from "@/features/sponsorship-planner/msw/handlers";
import {
  newSponsoredAccountId,
  secretSeed,
  sponsoredAccountId,
  sponsorAccountId,
  unknownSponsorAccountId
} from "@/features/sponsorship-planner/fixtures/sponsorshipPlanner.fixture";

const server = withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useSponsorshipPlanner", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useSponsorshipPlanner(), { wrapper });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("transitions through loading to success", async () => {
    server.use(slowSponsorHandler);
    const { result } = renderHook(() => useSponsorshipPlanner(), { wrapper });
    let request = Promise.resolve();

    act(() => {
      request = result.current.submit(sponsorAccountId, sponsoredAccountId);
    });
    expect(result.current.state).toEqual({ status: "loading" });

    await act(async () => {
      await request;
    });
    expect(result.current.state).toMatchObject({
      status: "success",
      data: { plannedUnits: 5 }
    });
  });

  it("attributes an invalid sponsor to the sponsor field", async () => {
    const { result } = renderHook(() => useSponsorshipPlanner(), { wrapper });

    await act(async () => {
      await result.current.submit("not-an-address", sponsoredAccountId);
    });

    expect(result.current.state).toEqual({
      status: "error",
      code: "invalid_sponsor",
      field: "sponsor"
    });
  });

  it("never carries a secret seed into hook state", async () => {
    const { result } = renderHook(() => useSponsorshipPlanner(), { wrapper });

    await act(async () => {
      await result.current.submit(sponsorAccountId, secretSeed);
    });

    expect(result.current.state).toEqual({
      status: "error",
      code: "invalid_sponsored",
      field: "sponsored"
    });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
  });

  it("reports a missing sponsor", async () => {
    const { result } = renderHook(() => useSponsorshipPlanner(), { wrapper });

    await act(async () => {
      await result.current.submit(unknownSponsorAccountId, sponsoredAccountId);
    });

    await waitFor(() =>
      expect(result.current.state).toEqual({
        status: "error",
        code: "sponsor_not_found",
        field: undefined
      })
    );
  });

  it("plans a brand-new sponsored account as success, not an error", async () => {
    const { result } = renderHook(() => useSponsorshipPlanner(), { wrapper });

    await act(async () => {
      await result.current.submit(sponsorAccountId, newSponsoredAccountId);
    });

    expect(result.current.state).toMatchObject({
      status: "success",
      data: { sponsoredAccountExists: false, plannedUnits: 2 }
    });
  });

  it("clears a result on reset", async () => {
    const { result } = renderHook(() => useSponsorshipPlanner(), { wrapper });

    await act(async () => {
      await result.current.submit(sponsorAccountId, sponsoredAccountId);
    });
    expect(result.current.state.status).toBe("success");

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
