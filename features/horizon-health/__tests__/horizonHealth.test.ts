import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import {
  degradedHorizonTestnet,
  healthyHorizonTestnet,
  malformedHorizonResponse
} from "@/features/horizon-health/fixtures/horizonHealth.fixture";
import {
  degradedHandler,
  handlers,
  malformedHandler,
  noRateLimitHandler,
  serverErrorHandler,
  unreachableHandler
} from "@/features/horizon-health/msw/handlers";
import {
  DEGRADED_LAG_THRESHOLD,
  getHorizonHealth,
  normalizeHorizonHealth
} from "@/features/horizon-health/lib/horizonHealth";

const server = withMswHandlers(...handlers);

describe("normalizeHorizonHealth", () => {
  it("normalizes healthy response payload and rate limit headers", () => {
    const headers = {
      "x-ratelimit-limit": "3600",
      "x-ratelimit-remaining": "3590",
      "x-ratelimit-reset": "3600"
    };

    const result = normalizeHorizonHealth(
      healthyHorizonTestnet,
      headers,
      "https://horizon-testnet.stellar.org",
      "testnet"
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.status).toBe("healthy");
    expect(result.value.lag).toBe(0);
    expect(result.value.coreLatestLedger).toBe(4634661);
    expect(result.value.ingestLatestLedger).toBe(4634661);
    expect(result.value.historyElderLedger).toBe(128);
    expect(result.value.historyLatestLedger).toBe(4634661);
    expect(result.value.horizonVersion).toContain("28.0.1");
    expect(result.value.coreVersion).toContain("stellar-core 28.0.1");
    expect(result.value.rateLimit.hasHeaders).toBe(true);
    expect(result.value.rateLimit.limit).toBe("3600");
    expect(result.value.rateLimit.remaining).toBe("3590");
    expect(result.value.rateLimit.reset).toBe("3600");
  });

  it("flags response as degraded when ingestion lag exceeds threshold", () => {
    const headers = {};
    const result = normalizeHorizonHealth(
      degradedHorizonTestnet,
      headers,
      "https://horizon-testnet.stellar.org",
      "testnet"
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.status).toBe("degraded");
    expect(result.value.lag).toBe(11);
    expect(result.value.lag).toBeGreaterThan(DEGRADED_LAG_THRESHOLD);
    expect(result.value.rateLimit.hasHeaders).toBe(false);
  });

  it("rejects non-object responses as unexpected_response", () => {
    const result = normalizeHorizonHealth(
      "string-payload",
      {},
      "https://horizon-testnet.stellar.org",
      "testnet"
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("unexpected_response");
    }
  });

  it("rejects payloads missing core ledger fields", () => {
    const result = normalizeHorizonHealth(
      malformedHorizonResponse,
      {},
      "https://horizon-testnet.stellar.org",
      "testnet"
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("unexpected_response");
    }
  });
});

describe("getHorizonHealth", () => {
  it("fetches testnet diagnostic successfully", async () => {
    const result = await getHorizonHealth("testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.network).toBe("testnet");
    expect(result.value.status).toBe("healthy");
    expect(result.value.rateLimit.hasHeaders).toBe(true);
  });

  it("fetches mainnet diagnostic successfully", async () => {
    const result = await getHorizonHealth("mainnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.network).toBe("mainnet");
    expect(result.value.coreLatestLedger).toBe(56000000);
  });

  it("identifies degraded status from lagging endpoint", async () => {
    server.use(degradedHandler);
    const result = await getHorizonHealth("testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.status).toBe("degraded");
    expect(result.value.lag).toBe(11);
  });

  it("handles endpoints without rate-limit headers", async () => {
    server.use(noRateLimitHandler);
    const result = await getHorizonHealth("testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.rateLimit.hasHeaders).toBe(false);
    expect(result.value.rateLimit.limit).toBeNull();
  });

  it("maps malformed responses to unexpected_response", async () => {
    server.use(malformedHandler);
    const result = await getHorizonHealth("testnet");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("unexpected_response");
    }
  });

  it("maps unreachable network to endpoint_unreachable", async () => {
    server.use(unreachableHandler);
    const result = await getHorizonHealth("testnet");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("endpoint_unreachable");
    }
  });

  it("maps 500 server errors to request_failed", async () => {
    server.use(serverErrorHandler);
    const result = await getHorizonHealth("testnet");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("request_failed");
    }
  });
});
