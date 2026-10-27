import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { runHorizonStreamSampler } from "../lib/horizonStreamSampler";
import { useHorizonStreamSampler } from "../hooks/useHorizonStreamSampler";
import { horizonStreamSamplerFixture } from "../fixtures/horizonStreamSampler.fixture";

vi.mock("../lib/horizonStreamSampler", () => ({ runHorizonStreamSampler: vi.fn() }));
function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}
function pendingResult() {
  let resolve!: (value: { ok: true; value: typeof horizonStreamSamplerFixture }) => void;
  const promise = new Promise<{ ok: true; value: typeof horizonStreamSamplerFixture }>((done) => { resolve = done; });
  return { promise, resolve };
}

describe("obsolete stream runs", () => {
  it("keeps reset idle even when an aborted run returns partial results", async () => {
    const pending = pendingResult();
    vi.mocked(runHorizonStreamSampler).mockReturnValueOnce(pending.promise);
    const { result } = renderHook(() => useHorizonStreamSampler(), { wrapper });
    let run!: Promise<void>;
    act(() => { run = result.current.submit("2,5"); });
    act(() => result.current.reset());
    await act(async () => { pending.resolve({ ok: true, value: horizonStreamSamplerFixture }); await run; });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("does not let an older run overwrite its replacement", async () => {
    const first = pendingResult();
    const second = pendingResult();
    vi.mocked(runHorizonStreamSampler).mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { result } = renderHook(() => useHorizonStreamSampler(), { wrapper });
    let firstRun!: Promise<void>;
    let secondRun!: Promise<void>;
    act(() => { firstRun = result.current.submit("2,5"); });
    act(() => { secondRun = result.current.submit("3,5"); });
    const latest = { ...horizonStreamSamplerFixture, events: [] };
    await act(async () => { second.resolve({ ok: true, value: latest }); await secondRun; });
    await act(async () => { first.resolve({ ok: true, value: horizonStreamSamplerFixture }); await firstRun; });
    expect(result.current.state).toEqual({ status: "success", result: latest });
  });
});
