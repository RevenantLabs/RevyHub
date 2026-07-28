import { describe, expect, it, vi } from "vitest";
import { checkSorobanRpc, createSorobanRpcController, normalizeJsonRpcError } from "../../lib/stellar/sorobanRpc";

const now = new Date("2026-07-28T12:00:00.000Z");

function response(result: unknown) {
  return Promise.resolve({ ok: true, json: () => Promise.resolve({ jsonrpc: "2.0", id: 1, result }) } as Response);
}

function fetcher(results: unknown[]) {
  return vi.fn((_url: string, init?: RequestInit) => {
    if (init?.signal?.aborted) return Promise.reject(new DOMException("Aborted", "AbortError"));
    return response(results.shift());
  }) as unknown as typeof fetch;
}

describe("checkSorobanRpc", () => {
  it("reports healthy latest-ledger details with latency and freshness", async () => {
    const result = await checkSorobanRpc("testnet", {
      now,
      fetcher: fetcher([
        { status: "healthy" },
        { sequence: 123, protocolVersion: 22, closedAt: "2026-07-28T11:59:45.000Z", networkPassphrase: "Test SDF Network ; September 2015" }
      ])
    });

    expect(result.state).toBe("healthy");
    expect(result.latestLedger).toBe(123);
    expect(result.protocolVersion).toBe(22);
    expect(result.freshnessSeconds).toBe(15);
    expect(result.rpcUrl).toBe("https://soroban-testnet.stellar.org");
  });

  it("distinguishes unhealthy, stale, wrong-network, and malformed responses", async () => {
    await expect(checkSorobanRpc("testnet", { now, fetcher: fetcher([{ status: "unhealthy" }, { sequence: 1, protocolVersion: 22, closedAt: now.toISOString() }]) })).resolves.toMatchObject({ state: "unhealthy" });
    await expect(checkSorobanRpc("testnet", { now, fetcher: fetcher([{ status: "healthy" }, { sequence: 1, protocolVersion: 22, closedAt: "2026-07-28T11:00:00.000Z" }]) })).resolves.toMatchObject({ state: "stale" });
    await expect(checkSorobanRpc("testnet", { now, fetcher: fetcher([{ status: "healthy" }, { sequence: 1, protocolVersion: 22, closedAt: now.toISOString(), networkPassphrase: "Public Global Stellar Network ; September 2015" }]) })).resolves.toMatchObject({ state: "wrong-network" });

    const malformedFetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ nope: true }) } as Response)) as unknown as typeof fetch;
    await expect(checkSorobanRpc("testnet", { now, fetcher: malformedFetch })).resolves.toMatchObject({ state: "malformed" });
  });

  it("marks partial latest-ledger JSON as freshness unavailable", async () => {
    const result = await checkSorobanRpc("testnet", { now, fetcher: fetcher([{ status: "healthy" }, { sequence: 7 }]) });
    expect(result.state).toBe("partial");
    expect(result.freshnessAvailable).toBe(false);
  });

  it("normalizes JSON-RPC errors", () => {
    expect(normalizeJsonRpcError({ error: { code: -32601, message: "Method not found" } })).toMatchObject({ state: "error", message: "Method not found (-32601)" });
  });

  it("cancels previous refresh signals", () => {
    const controller = createSorobanRpcController();
    const first = controller.nextSignal();
    const second = controller.nextSignal();
    expect(first.aborted).toBe(true);
    expect(second.aborted).toBe(false);
  });

  it("reports timeout distinctly", async () => {
    const slowFetch = vi.fn((_url: string, init?: RequestInit) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    })) as unknown as typeof fetch;
    const result = await checkSorobanRpc("testnet", { now, timeoutMs: 1, fetcher: slowFetch });
    expect(result.state).toBe("timeout");
  });
});
