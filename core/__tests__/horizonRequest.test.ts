import { afterEach, describe, expect, it, vi } from "vitest";
import {
  HORIZON_REQUEST_TIMEOUT_MS,
  HorizonRequestCancelledError,
  HorizonRequestTimeoutError,
  isCancelledError,
  isTimeoutError,
  runHorizonRequest
} from "@/core/horizon/request";

describe("runHorizonRequest", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves a request that completes in time", async () => {
    await expect(runHorizonRequest(Promise.resolve("ok"))).resolves.toBe("ok");
  });

  it("defaults to a ten-second budget", () => {
    expect(HORIZON_REQUEST_TIMEOUT_MS).toBe(10_000);
  });

  it("propagates the request's own rejection unchanged", async () => {
    const failure = new Error("horizon said no");
    await expect(runHorizonRequest(Promise.reject(failure))).rejects.toBe(failure);
  });

  it("rejects immediately when the signal has already aborted", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      runHorizonRequest(Promise.resolve("ok"), { signal: controller.signal })
    ).rejects.toBeInstanceOf(HorizonRequestCancelledError);
  });

  it("cancels a pending request through the caller signal", async () => {
    const controller = new AbortController();
    const result = runHorizonRequest(new Promise<string>(() => {}), {
      signal: controller.signal,
      timeoutMs: 1_000
    });

    controller.abort();

    await expect(result).rejects.toBeInstanceOf(HorizonRequestCancelledError);
  });

  it("rejects a slow request with a stable timeout error", async () => {
    vi.useFakeTimers();
    const result = runHorizonRequest(new Promise<string>(() => {}), { timeoutMs: 25 });
    const assertion = expect(result).rejects.toBeInstanceOf(HorizonRequestTimeoutError);

    await vi.advanceTimersByTimeAsync(25);
    await assertion;
  });

  it("settles only once when a request resolves after being cancelled", async () => {
    const controller = new AbortController();
    let resolveLate: (value: string) => void = () => {};
    const late = new Promise<string>((resolve) => {
      resolveLate = resolve;
    });

    const result = runHorizonRequest(late, { signal: controller.signal });
    controller.abort();
    resolveLate("too late");

    await expect(result).rejects.toBeInstanceOf(HorizonRequestCancelledError);
  });
});

describe("error predicates", () => {
  it("keeps cancellation and timeout distinct", () => {
    expect(isCancelledError(new HorizonRequestCancelledError())).toBe(true);
    expect(isCancelledError(new HorizonRequestTimeoutError())).toBe(false);
    expect(isTimeoutError(new HorizonRequestTimeoutError())).toBe(true);
    expect(isTimeoutError(new HorizonRequestCancelledError())).toBe(false);
  });

  it("treats a DOM AbortError as a cancellation", () => {
    expect(isCancelledError(new DOMException("aborted", "AbortError"))).toBe(true);
  });

  it("does not claim an unrelated error", () => {
    expect(isCancelledError(new Error("boom"))).toBe(false);
    expect(isTimeoutError(new Error("boom"))).toBe(false);
  });
});
