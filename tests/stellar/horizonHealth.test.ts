import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkHorizonHealth } from "../../lib/stellar/horizonHealth";
import { networkPassphrases } from "../../lib/stellar/horizon";

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => body
  } as Response;
}

function healthyRootBody(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    horizon_version: "22.0.0",
    network_passphrase: networkPassphrases.testnet,
    history_latest_ledger: 1000,
    history_latest_ledger_closed_at: new Date().toISOString(),
    ...overrides
  };
}

function delayedFetch(ms: number, respond: () => Response) {
  return vi.fn((_url: string, init?: RequestInit) => {
    return new Promise<Response>((resolve, reject) => {
      const timer = setTimeout(() => resolve(respond()), ms);
      init?.signal?.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("checkHorizonHealth", () => {
  it("reports healthy status for a fresh, correctly-identified ledger", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(healthyRootBody())));

    const result = await checkHorizonHealth("testnet");

    expect(result.status).toBe("healthy");
    expect(result.horizonVersion).toBe("22.0.0");
    expect(result.networkPassphrase).toBe(networkPassphrases.testnet);
    expect(result.currentLedger).toBe(1000);
  });

  it("still reports healthy and measures latency for a slow-but-successful response under the timeout", async () => {
    vi.stubGlobal("fetch", delayedFetch(3000, () => jsonResponse(healthyRootBody())));

    const promise = checkHorizonHealth("testnet", { timeoutMs: 8000 });
    await vi.advanceTimersByTimeAsync(3000);
    const result = await promise;

    expect(result.status).toBe("healthy");
    expect(result.latencyMs).toBeGreaterThanOrEqual(3000);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("reports stale-ledger when the latest ledger is older than the freshness threshold", async () => {
    const staleClosedAt = new Date(Date.now() - 120_000).toISOString();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(healthyRootBody({ history_latest_ledger_closed_at: staleClosedAt })))
    );

    const result = await checkHorizonHealth("testnet", { staleAfterSeconds: 60 });

    expect(result.status).toBe("stale-ledger");
    expect(result.ledgerAgeSeconds).toBeGreaterThan(60);
  });

  it("reports wrong-network when the passphrase does not match the selected network", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(healthyRootBody({ network_passphrase: networkPassphrases.mainnet }))
      )
    );

    const result = await checkHorizonHealth("testnet");

    expect(result.status).toBe("wrong-network");
    expect(result.networkPassphrase).toBe(networkPassphrases.mainnet);
    expect(result.expectedNetworkPassphrase).toBe(networkPassphrases.testnet);
  });

  it("reports timeout when Horizon does not respond in time, and leaves no pending timers", async () => {
    vi.stubGlobal("fetch", delayedFetch(20_000, () => jsonResponse(healthyRootBody())));

    const promise = checkHorizonHealth("testnet", { timeoutMs: 5000 });
    await vi.advanceTimersByTimeAsync(5000);
    const result = await promise;

    expect(result.status).toBe("timeout");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("reports network-error for a fetch-level (TLS/connection) failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      })
    );

    const result = await checkHorizonHealth("testnet");

    expect(result.status).toBe("network-error");
  });

  it("reports network-error for a non-ok HTTP response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({}, false, 503)));

    const result = await checkHorizonHealth("testnet");

    expect(result.status).toBe("network-error");
    expect(result.message).toMatch(/503/);
  });

  it("reports malformed-response when the body is not valid JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError("Unexpected token");
        }
      })) as unknown as typeof fetch
    );

    const result = await checkHorizonHealth("testnet");

    expect(result.status).toBe("malformed-response");
  });

  it("reports malformed-response when expected root fields are missing", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ horizon_version: "22.0.0" })));

    const result = await checkHorizonHealth("testnet");

    expect(result.status).toBe("malformed-response");
  });

  it("rejects with an AbortError when externally cancelled, and leaves no pending timers", async () => {
    vi.stubGlobal("fetch", delayedFetch(10_000, () => jsonResponse(healthyRootBody())));

    const controller = new AbortController();
    const promise = checkHorizonHealth("testnet", { signal: controller.signal, timeoutMs: 8000 });

    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: "AbortError" });
    expect(vi.getTimerCount()).toBe(0);
  });
});
