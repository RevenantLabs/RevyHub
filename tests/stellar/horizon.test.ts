import { afterEach, describe, expect, it, vi } from "vitest";
import {
  HORIZON_REQUEST_TIMEOUT_MS,
  HorizonRequestCancelledError,
  HorizonRequestTimeoutError,
  runHorizonRequest,
  mapHorizonError,
  HorizonError
} from "@/lib/stellar/horizon";

function horizonError(status: number) {
  return { response: { status } };
}

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

describe("mapHorizonError", () => {
  it("maps 404 to not_found", () => {
    const err = mapHorizonError(horizonError(404), "account");
    expect(err).toBeInstanceOf(HorizonError);
    expect(err.code).toBe("not_found");
    expect(err.message).toContain("account");
  });

  it("maps 429 to rate_limited", () => {
    const err = mapHorizonError(horizonError(429), "transaction");
    expect(err).toBeInstanceOf(HorizonError);
    expect(err.code).toBe("rate_limited");
    expect(err.message).toMatch(/rate limit/i);
  });

  it("maps 500 to server_error", () => {
    const err = mapHorizonError(horizonError(500), "account");
    expect(err.code).toBe("server_error");
  });

  it("maps 503 to server_error", () => {
    const err = mapHorizonError(horizonError(503), "account");
    expect(err.code).toBe("server_error");
  });

  it("maps a fetch/network Error to timeout", () => {
    const err = mapHorizonError(new Error("fetch failed"), "account");
    expect(err.code).toBe("timeout");
    expect(err.message).toMatch(/connection/i);
  });

  it("maps a timeout Error to timeout", () => {
    const err = mapHorizonError(new Error("Request timeout"), "account");
    expect(err.code).toBe("timeout");
  });

  it("maps a network Error to timeout", () => {
    const err = mapHorizonError(new Error("network error"), "account");
    expect(err.code).toBe("timeout");
  });

  it("maps unknown errors to unknown", () => {
    const err = mapHorizonError(new Error("something unexpected"), "account");
    expect(err.code).toBe("unknown");
  });

  it("maps null to unknown", () => {
    const err = mapHorizonError(null, "account");
    expect(err.code).toBe("unknown");
  });

  it("includes the context in the unknown message", () => {
    const err = mapHorizonError(new Error("boom"), "transaction");
    expect(err.message).toContain("transaction");
  });
});
