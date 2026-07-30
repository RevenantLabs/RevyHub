import { afterEach, describe, expect, it, vi } from "vitest";
import {
  HORIZON_REQUEST_TIMEOUT_MS,
  HorizonRequestCancelledError,
  HorizonRequestTimeoutError,
  runHorizonRequest
} from "@/lib/stellar/horizon";

describe("runHorizonRequest", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a completed Horizon result", async () => {
    await expect(runHorizonRequest(Promise.resolve("ok"))).resolves.toBe("ok");
    expect(HORIZON_REQUEST_TIMEOUT_MS).toBe(10_000);
  });

  it("cancels a pending request through the caller signal", async () => {
    const controller = new AbortController();
    const pending = new Promise<string>(() => {});
    const result = runHorizonRequest(pending, {
      signal: controller.signal,
      timeoutMs: 1_000
    });

    controller.abort();

    await expect(result).rejects.toBeInstanceOf(HorizonRequestCancelledError);
  });

  it("rejects a slow request with a stable timeout error", async () => {
    vi.useFakeTimers();
    const pending = new Promise<string>(() => {});
    const result = runHorizonRequest(pending, { timeoutMs: 25 });
    const assertion = expect(result).rejects.toBeInstanceOf(HorizonRequestTimeoutError);

    await vi.advanceTimersByTimeAsync(25);
    await assertion;
  });
});
