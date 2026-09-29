import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  describeFreshness,
  networkPassphrases,
  sorobanDiagnostic,
  SorobanRpcError,
  SOROBAN_TIMEOUT_MS,
  sorobanRpcUrls,
  STALE_LEDGER_SECONDS
} from "../../lib/stellar/soroban";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Mock fetch with method-based routing: returns a response based on which
 * JSON-RPC method is in the request body.
 */
function mockFetchRouting(
  healthResponse: unknown,
  ledgerResponse: unknown,
  networkResponse: unknown
) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(
    async (_url, init) => {
      const body =
        init && typeof init === "object" && "body" in init
          ? JSON.parse(init.body as string)
          : {};
      let result: unknown;
      if (body.method === "getHealth") {
        result = healthResponse;
      } else if (body.method === "getLatestLedger") {
        result = ledgerResponse;
      } else {
        result = networkResponse;
      }
      return { ok: true, json: async () => result } as Response;
    }
  );
}

function mockFetch(response: unknown, status = 200) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => response
    } as Response;
  });
}

function mockFetchNever() {
  return vi.spyOn(globalThis, "fetch").mockImplementation(
    (_url, init) =>
      new Promise<never>((_resolve, reject) => {
        const signal =
          init && typeof init === "object" && "signal" in init
            ? (init as RequestInit).signal
            : undefined;
        if (signal) {
          signal.addEventListener(
            "abort",
            () => reject(signal.reason),
            { once: true }
          );
        }
      })
  );
}

function mockFetchReject(reason: unknown) {
  return vi.spyOn(globalThis, "fetch").mockRejectedValue(reason);
}

const defaultHealth = {
  jsonrpc: "2.0",
  id: 1,
  result: {
    status: "healthy",
    latestLedger: 3730763,
    latestLedgerCloseTime: now() - 5,
    oldestLedger: 3609804,
    oldestLedgerCloseTime: now() - 86400,
    ledgerRetentionWindow: 120960
  }
};

function now() {
  return Math.floor(Date.now() / 1000);
}

const defaultLedger = {
  jsonrpc: "2.0",
  id: 2,
  result: {
    id: "0a00a9cf845f7af7cff09c66f8ae6480e9971e6e2c7fa4afd8d6266ee13c987b",
    protocolVersion: "27",
    sequence: 3730795,
    closeTime: now() - 5
  }
};

const defaultNetwork = {
  jsonrpc: "2.0",
  id: 3,
  result: {
    passphrase: networkPassphrases.testnet,
    protocolVersion: "27"
  }
};

// ---------------------------------------------------------------------------
// describeFreshness
// ---------------------------------------------------------------------------

describe("describeFreshness", () => {
  it('returns "Unavailable" for null', () => {
    expect(describeFreshness(null)).toBe("Unavailable");
  });

  it('returns "Just closed" for < 5s', () => {
    expect(describeFreshness(3)).toBe("Just closed");
  });

  it("returns seconds ago for < 60s", () => {
    expect(describeFreshness(42)).toBe("42s ago");
  });

  it("returns minutes ago for < 3600s", () => {
    expect(describeFreshness(125)).toBe("2m 5s ago");
  });

  it("returns hours ago for >= 3600s", () => {
    expect(describeFreshness(7323)).toBe("2h 2m ago");
  });
});

// ---------------------------------------------------------------------------
// sorobanDiagnostic – happy path
// ---------------------------------------------------------------------------

describe("sorobanDiagnostic", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("returns a consolidated result for a healthy testnet node", async () => {
    const fetchSpy = mockFetchRouting(
      defaultHealth,
      defaultLedger,
      defaultNetwork
    );

    const result = await sorobanDiagnostic("testnet");

    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(result.health.status).toBe("healthy");
    expect(result.health.latestLedger).toBe(3730763);
    expect(result.latestLedger.sequence).toBe(3730795);
    expect(result.latestLedger.protocolVersion).toBe("27");
    expect(result.latestLedger.id).toBe(
      "0a00a9cf845f7af7cff09c66f8ae6480e9971e6e2c7fa4afd8d6266ee13c987b"
    );
    // closeTime = now() - 5, checkedAt ≈ now(), so freshness ≈ 5
    expect(result.freshnessSeconds).toBeGreaterThanOrEqual(4);
    expect(result.freshnessSeconds).toBeLessThanOrEqual(6);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    // checkedAt should be close to now()
    expect(result.checkedAt).toBeGreaterThanOrEqual(now() - 1);
    expect(result.checkedAt).toBeLessThanOrEqual(now() + 1);

    fetchSpy.mockRestore();
  });

  it("calls the correct RPC URL and uses the right network passphrase", async () => {
    const fetchSpy = mockFetchRouting(
      defaultHealth,
      defaultLedger,
      defaultNetwork
    );

    await sorobanDiagnostic("testnet");

    // All 3 calls should go to the testnet URL.
    const calls = fetchSpy.mock.calls;
    expect(calls.length).toBe(3);
    for (const call of calls) {
      const url = typeof call[0] === "string" ? call[0] : "";
      expect(url).toBe(sorobanRpcUrls.testnet);
    }

    fetchSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Error states
// ---------------------------------------------------------------------------

describe("sorobanDiagnostic – error states", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  /**
   * Promise.all with abortable fetches rejects the combined promise
   * on the first rejection, leaving the second rejection unhandled in
   * microtask isolation. Suppress expected rejections at the process level.
   */
  function suppressUnhandled() {
    const handler = () => {
      /* swallow expected timeout rejections */
    };
    process.on("unhandledRejection", handler);
    return () => process.off("unhandledRejection", handler);
  }

  it("throws timeout error when RPC does not respond", async () => {
    const cleanup = suppressUnhandled();
    mockFetchNever();

    const waitPromise = sorobanDiagnostic("testnet");

    await vi.advanceTimersByTimeAsync(SOROBAN_TIMEOUT_MS + 100);

    await expect(waitPromise).rejects.toThrow(SorobanRpcError);
    await expect(waitPromise).rejects.toMatchObject({ kind: "timeout" });

    cleanup();
  });

  it("throws cancel error when aborted before completion", async () => {
    mockFetchNever();

    const controller = new AbortController();
    const waitPromise = sorobanDiagnostic("testnet", controller.signal);

    controller.abort();

    await expect(waitPromise).rejects.toMatchObject({
      kind: "unknown",
      message: "Request was cancelled."
    });
  });

  it("throws unhealthy error when health status is not 'healthy'", async () => {
    mockFetchRouting(
      {
        jsonrpc: "2.0",
        id: 1,
        result: {
          status: "unhealthy",
          latestLedger: 100,
          latestLedgerCloseTime: 0,
          oldestLedger: 50,
          oldestLedgerCloseTime: 0,
          ledgerRetentionWindow: 1000
        }
      },
      defaultLedger,
      defaultNetwork
    );

    await expect(sorobanDiagnostic("testnet")).rejects.toMatchObject({
      kind: "unhealthy"
    });
  });

  it("throws wrong_network error when RPC passphrase mismatches", async () => {
    mockFetchRouting(
      defaultHealth,
      defaultLedger,
      {
        jsonrpc: "2.0",
        id: 3,
        result: {
          passphrase: networkPassphrases.mainnet, // Wrong passphrase for testnet
          protocolVersion: "27"
        }
      }
    );

    await expect(sorobanDiagnostic("testnet")).rejects.toMatchObject({
      kind: "wrong_network"
    });
  });

  it("throws stale error when latest ledger is older than the threshold", async () => {
    // Set closeTime to be well beyond the stale threshold.
    const staleLedger = {
      ...defaultLedger,
      result: {
        ...defaultLedger.result,
        closeTime: Math.floor(Date.now() / 1000) - STALE_LEDGER_SECONDS - 60
      }
    };

    mockFetchRouting(defaultHealth, staleLedger, defaultNetwork);

    await expect(sorobanDiagnostic("testnet")).rejects.toMatchObject({
      kind: "stale"
    });
  });

  it("throws unreachable error when fetch fails with a TypeError", async () => {
    mockFetchReject(new TypeError("Failed to fetch"));

    await expect(sorobanDiagnostic("testnet")).rejects.toMatchObject({
      kind: "unreachable"
    });
  });

  it("throws malformed error when JSON-RPC response has no result or error", async () => {
    mockFetch({ jsonrpc: "2.0", id: 1 });

    await expect(sorobanDiagnostic("testnet")).rejects.toMatchObject({
      kind: "malformed"
    });
  });

  it("throws rpc_error when JSON-RPC response has an error object", async () => {
    mockFetch({
      jsonrpc: "2.0",
      id: 1,
      error: { code: -32000, message: "endpoint not found" }
    });

    await expect(sorobanDiagnostic("testnet")).rejects.toMatchObject({
      kind: "rpc_error"
    });
  });

  it("throws unreachable on HTTP error status", async () => {
    mockFetch({}, 503);

    await expect(sorobanDiagnostic("testnet")).rejects.toMatchObject({
      kind: "unreachable"
    });
  });

  it("handles cancellation when a new request aborts the previous one", async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, "abort");
    mockFetchReject(new DOMException("Aborted", "AbortError"));

    await expect(sorobanDiagnostic("testnet")).rejects.toMatchObject({
      kind: "unknown",
      message: "Request was cancelled."
    });

    abortSpy.mockRestore();
  });

  it("returns freshness for a non-stale ledger", async () => {
    // closeTime is recent (within threshold).
    const freshLedger = {
      ...defaultLedger,
      result: {
        ...defaultLedger.result,
        closeTime: Math.floor(Date.now() / 1000) - 10
      }
    };

    mockFetchRouting(defaultHealth, freshLedger, defaultNetwork);

    const result = await sorobanDiagnostic("testnet");
    expect(result.freshnessSeconds).toBe(10);
  });

  it("produces null freshness when no close time is available", async () => {
    const noCloseHealth = {
      ...defaultHealth,
      result: { ...defaultHealth.result, latestLedgerCloseTime: 0 }
    };
    const noCloseLedger = {
      ...defaultLedger,
      result: { ...defaultLedger.result, closeTime: 0 }
    };

    mockFetchRouting(noCloseHealth, noCloseLedger, defaultNetwork);

    const result = await sorobanDiagnostic("testnet");
    expect(result.freshnessSeconds).toBeNull();
  });
});
