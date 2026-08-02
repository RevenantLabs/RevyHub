import { describe, expect, it, vi } from "vitest";
import { server } from "./setup";
import {
  simulateNotFound,
  simulateRateLimit,
  simulateServerError,
  simulateDelay,
  simulateMalformedJson,
  simulateTrustlineExists
} from "./test-utils";
import {
  createAccountFixture,
  createTransactionFixture,
  createFeeFixture,
  createFriendbotSuccessFixture,
  createErrorFixture
} from "./fixtures";

/* ------------------------------------------------------------------ */
/*  Fixture integrity                                                 */
/* ------------------------------------------------------------------ */

describe("fixture integrity", () => {
  it("creates a valid account fixture with native balance", () => {
    const fixture = createAccountFixture();
    expect(fixture.account_id).toMatch(/^G/);
    expect(fixture.balances).toHaveLength(1);
    expect(fixture.balances[0].asset_type).toBe("native");
  });

  it("creates a transaction fixture with a 64-char hash", () => {
    const fixture = createTransactionFixture();
    expect(fixture.hash).toHaveLength(64);
    expect(fixture.ledger).toBeGreaterThan(0);
    expect(fixture.successful).toBe(true);
  });

  it("creates a fee fixture with valid stats", () => {
    const fixture = createFeeFixture();
    expect(fixture.last_ledger_base_fee).toBe(100);
    expect(fixture.fee_charged.mode).toBeGreaterThan(0);
  });

  it("creates a friendbot success fixture", () => {
    const fixture = createFriendbotSuccessFixture();
    expect(fixture.hash).toHaveLength(64);
    expect(fixture.latestLedger).toBeGreaterThan(0);
  });

  it("creates an error fixture with matching status", () => {
    const fixture = createErrorFixture(404, "Not found");
    expect(fixture.status).toBe(404);
    expect(fixture.title).toBe("Resource Missing");
    expect(fixture.detail).toBe("Not found");
  });

  it("supports overrides on account fixture", () => {
    const fixture = createAccountFixture({ sequence: "999" });
    expect(fixture.sequence).toBe("999");
  });

  it("account fixture never contains real user account data", () => {
    const fixture = createAccountFixture();
    expect(fixture.account_id).toBe(fixture.id);
    // Verify it's a random-generated key, not a known real address
    expect(fixture.account_id.length).toBe(56);
  });
});

/* ------------------------------------------------------------------ */
/*  Default handler responses                                         */
/* ------------------------------------------------------------------ */

describe("default handlers resolve correctly", () => {
  it("returns account data for a Horizon account request", async () => {
    const response = await fetch("https://horizon-testnet.stellar.org/accounts/GBXXXX");
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.account_id).toBe("GBXXXX");
    expect(data.balances).toBeDefined();
  });

  it("returns transaction data for a Horizon transaction request", async () => {
    const response = await fetch("https://horizon-testnet.stellar.org/transactions/abc123");
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.hash).toBeDefined();
    expect(data.successful).toBe(true);
  });

  it("returns fee stats for the Horizon fee endpoint", async () => {
    const response = await fetch("https://horizon-testnet.stellar.org/fee");
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.last_ledger_base_fee).toBeDefined();
    expect(data.fee_charged.mode).toBeDefined();
  });

  it("returns friendbot success for a valid addr param", async () => {
    const response = await fetch("https://friendbot.stellar.org?addr=GBXXXX");
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.hash).toBeDefined();
  });

  it("returns 400 from friendbot when addr param is missing", async () => {
    const response = await fetch("https://friendbot.stellar.org");
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.status).toBe(400);
  });

  it("handles mainnet Horizon endpoints", async () => {
    const response = await fetch("https://horizon.stellar.org/accounts/GBYYYY");
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.account_id).toBe("GBYYYY");
  });
});

/* ------------------------------------------------------------------ */
/*  Per-test overrides                                                */
/* ------------------------------------------------------------------ */

describe("per-test overrides", () => {
  it("simulateNotFound returns 404", async () => {
    server.use(simulateNotFound());

    const response = await fetch("https://horizon-testnet.stellar.org/accounts/GBXXXX");
    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data.title).toBe("Resource Missing");
  });

  it("simulateRateLimit returns 429", async () => {
    server.use(simulateRateLimit());

    const response = await fetch("https://horizon-testnet.stellar.org/accounts/GBXXXX");
    expect(response.status).toBe(429);

    const data = await response.json();
    expect(data.title).toBe("Rate Limit Exceeded");
  });

  it("simulateServerError returns 500", async () => {
    server.use(simulateServerError());

    const response = await fetch("https://horizon-testnet.stellar.org/accounts/GBXXXX");
    expect(response.status).toBe(500);
  });

  it("simulateMalformedJson returns non-JSON body", async () => {
    server.use(simulateMalformedJson());

    const response = await fetch("https://horizon-testnet.stellar.org/accounts/GBXXXX");
    const text = await response.text();
    expect(text).toBe("this is not valid json");
  });

  it("simulateTrustlineExists returns account with trustline", async () => {
    server.use(simulateTrustlineExists("USDC", "GABCDEF"));

    const response = await fetch("https://horizon-testnet.stellar.org/accounts/GBXXXX");
    const data = await response.json();
    const issued = data.balances.find(
      (b: { asset_type: string }) => b.asset_type !== "native"
    );
    expect(issued).toBeDefined();
    expect(issued.asset_code).toBe("USDC");
  });

  it("simulateDelay delays the response", async () => {
    vi.useFakeTimers();
    server.use(simulateDelay(5000));

    const fetchPromise = fetch("https://horizon-testnet.stellar.org/accounts/GBXXXX");

    // Advance time to trigger the response
    await vi.advanceTimersByTimeAsync(5000);

    const response = await fetchPromise;
    expect(response.ok).toBe(true);
    vi.useRealTimers();
  });

  it("overrides are reset after each test", async () => {
    // After previous tests used overrides, this test uses default handler
    const response = await fetch("https://horizon-testnet.stellar.org/accounts/GBXXXX");
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.account_id).toBe("GBXXXX");
  });
});

/* ------------------------------------------------------------------ */
/*  Unhandled request detection                                       */
/* ------------------------------------------------------------------ */

describe("unhandled request detection", () => {
  it("fails on an unexpected URL", async () => {
    await expect(
      fetch("https://some-unexpected-api.com/endpoint")
    ).rejects.toThrow();
  });
});
