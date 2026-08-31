import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { useEffectsTimeline } from "@/features/effects-timeline/hooks/useEffectsTimeline";
import { PAGE_SIZE } from "@/features/effects-timeline/lib/effectsTimeline";
import {
  handlers,
  rateLimitedHandler,
  slowEffectsHandler
} from "@/features/effects-timeline/msw/handlers";
import {
  accountId,
  quietAccountId,
  secretSeed,
  straddlingTransactionId,
  unknownAccountId
} from "@/features/effects-timeline/fixtures/effectsTimeline.fixture";

const server = withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

async function loadFirstPage() {
  const view = renderHook(() => useEffectsTimeline(), { wrapper });
  await act(async () => {
    await view.result.current.submit(accountId);
  });
  return view;
}

describe("useEffectsTimeline", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useEffectsTimeline(), { wrapper });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("transitions through loading to success", async () => {
    server.use(slowEffectsHandler);
    const { result } = renderHook(() => useEffectsTimeline(), { wrapper });
    let request = Promise.resolve();

    act(() => {
      request = result.current.submit(accountId);
    });
    expect(result.current.state).toEqual({ status: "loading" });

    await act(async () => {
      await request;
    });

    expect(result.current.state).toMatchObject({
      status: "success",
      pageIndex: 0,
      page: { effectCount: PAGE_SIZE, hasOlder: true }
    });
  });

  it("rejects invalid input before making a request", async () => {
    const { result } = renderHook(() => useEffectsTimeline(), { wrapper });

    await act(async () => {
      await result.current.submit("not-an-address");
    });

    expect(result.current.state).toEqual({ status: "error", code: "invalid_address" });
  });

  it("never carries a secret seed into hook state", async () => {
    const { result } = renderHook(() => useEffectsTimeline(), { wrapper });

    await act(async () => {
      await result.current.submit(secretSeed);
    });

    expect(result.current.state).toEqual({ status: "error", code: "invalid_address" });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
  });

  it("reports a missing account", async () => {
    const { result } = renderHook(() => useEffectsTimeline(), { wrapper });

    await act(async () => {
      await result.current.submit(unknownAccountId);
    });

    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", code: "account_not_found" })
    );
  });

  it("reports rate limiting", async () => {
    server.use(rateLimitedHandler);
    const { result } = renderHook(() => useEffectsTimeline(), { wrapper });

    await act(async () => {
      await result.current.submit(accountId);
    });

    expect(result.current.state).toEqual({ status: "error", code: "rate_limited" });
  });

  it("succeeds with an empty page for an account that has no effects", async () => {
    const { result } = renderHook(() => useEffectsTimeline(), { wrapper });

    await act(async () => {
      await result.current.submit(quietAccountId);
    });

    expect(result.current.state).toMatchObject({
      status: "success",
      page: { effectCount: 0, hasOlder: false }
    });
  });

  it("pages older, then replays the stored cursor to come back", async () => {
    const { result } = await loadFirstPage();

    await act(async () => {
      await result.current.showOlder();
    });

    expect(result.current.state).toMatchObject({
      status: "success",
      pageIndex: 1,
      page: { effectCount: 3, hasOlder: false }
    });
    if (result.current.state.status !== "success") throw new Error("expected a page");
    expect(result.current.state.page.groups[0]).toMatchObject({
      transactionId: straddlingTransactionId,
      continuedFromNewerPage: true
    });

    await act(async () => {
      await result.current.showNewer();
    });

    expect(result.current.state).toMatchObject({
      status: "success",
      pageIndex: 0,
      page: { effectCount: PAGE_SIZE, hasOlder: true }
    });
  });

  it("does nothing at either end of the timeline", async () => {
    const { result } = await loadFirstPage();

    // Page one is the newest page: there is nothing newer to fetch.
    await act(async () => {
      await result.current.showNewer();
    });
    expect(result.current.state).toMatchObject({ status: "success", pageIndex: 0 });

    await act(async () => {
      await result.current.showOlder();
    });
    expect(result.current.state).toMatchObject({ status: "success", pageIndex: 1 });

    // Page two is the oldest page: `hasOlder` is false, so this is a no-op.
    await act(async () => {
      await result.current.showOlder();
    });
    expect(result.current.state).toMatchObject({ status: "success", pageIndex: 1 });
  });

  it("returns to page one when a new address is submitted", async () => {
    const { result } = await loadFirstPage();

    await act(async () => {
      await result.current.showOlder();
    });
    expect(result.current.state).toMatchObject({ pageIndex: 1 });

    await act(async () => {
      await result.current.submit(accountId);
    });
    expect(result.current.state).toMatchObject({ pageIndex: 0 });
  });

  it("clears the timeline on reset", async () => {
    const { result } = await loadFirstPage();
    expect(result.current.state.status).toBe("success");

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
