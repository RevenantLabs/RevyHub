/**
 * Self-tests for the MSW harness.
 *
 * Verifies that:
 *  - Default handlers return the expected fixture shapes.
 *  - Per-test scenario overrides take effect and are cleaned up afterwards.
 *  - Unhandled requests throw rather than reaching the network.
 */

import { describe, expect, it } from "vitest";
import { server } from "./setup";
import { scenarioHandlers } from "./handlers";
import {
  FIXTURE_ACCOUNT_ID,
  FIXTURE_TX_HASH,
  accountFixture,
  transactionFixture,
  feeStatsFixture,
  friendbotSuccessFixture
} from "./fixtures";

const TESTNET = "https://horizon-testnet.stellar.org";
const FRIENDBOT = "https://friendbot.stellar.org";

// ---------------------------------------------------------------------------
// Default handler coverage
// ---------------------------------------------------------------------------

describe("default handlers", () => {
  it("returns the account fixture for the canonical address", async () => {
    const res = await fetch(`${TESTNET}/accounts/${FIXTURE_ACCOUNT_ID}`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.account_id).toBe(accountFixture.account_id);
    expect(body.balances).toHaveLength(accountFixture.balances.length);
  });

  it("returns 404 for an unknown account address", async () => {
    const unknown = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    const res = await fetch(`${TESTNET}/accounts/${unknown}`);
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.status).toBe(404);
  });

  it("returns the transaction fixture for the canonical hash", async () => {
    const res = await fetch(`${TESTNET}/transactions/${FIXTURE_TX_HASH}`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.hash).toBe(transactionFixture.hash);
    expect(body.successful).toBe(true);
    expect(body.memo).toBe(transactionFixture.memo);
  });

  it("returns 404 for an unknown transaction hash", async () => {
    const unknownHash = "b".repeat(64);
    const res = await fetch(`${TESTNET}/transactions/${unknownHash}`);
    expect(res.status).toBe(404);
  });

  it("returns the fee stats fixture", async () => {
    const res = await fetch(`${TESTNET}/fee_stats`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.last_ledger_base_fee).toBe(feeStatsFixture.last_ledger_base_fee);
  });

  it("returns the Friendbot success fixture for a valid address", async () => {
    const res = await fetch(
      `${FRIENDBOT}?addr=${encodeURIComponent(FIXTURE_ACCOUNT_ID)}`
    );
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.hash).toBe(friendbotSuccessFixture.hash);
    expect(body.ledger).toBe(friendbotSuccessFixture.ledger);
  });

  it("returns 404 from Friendbot when addr param is missing", async () => {
    const res = await fetch(FRIENDBOT);
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// Per-test scenario overrides
// ---------------------------------------------------------------------------

describe("scenario overrides", () => {
  it("overrides account to return 404 and resets to default afterwards", async () => {
    server.use(scenarioHandlers.accountNotFound);

    const overrideRes = await fetch(`${TESTNET}/accounts/${FIXTURE_ACCOUNT_ID}`);
    expect(overrideRes.status).toBe(404);
  });

  it("default account handler is restored after the override test", async () => {
    // No server.use() here — default should be back in force
    const res = await fetch(`${TESTNET}/accounts/${FIXTURE_ACCOUNT_ID}`);
    expect(res.status).toBe(200);
  });

  it("overrides account to return 429 rate-limit", async () => {
    server.use(scenarioHandlers.accountRateLimited);

    const res = await fetch(`${TESTNET}/accounts/${FIXTURE_ACCOUNT_ID}`);
    expect(res.status).toBe(429);

    const body = await res.json();
    expect(body.title).toMatch(/Too Many Requests/);
  });

  it("overrides account to return 500 server error", async () => {
    server.use(scenarioHandlers.accountServerError);

    const res = await fetch(`${TESTNET}/accounts/${FIXTURE_ACCOUNT_ID}`);
    expect(res.status).toBe(500);
  });

  it("overrides Friendbot to return already-funded 400", async () => {
    server.use(scenarioHandlers.friendbotAlreadyFunded);

    const res = await fetch(
      `${FRIENDBOT}?addr=${encodeURIComponent(FIXTURE_ACCOUNT_ID)}`
    );
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.extras?.result_codes?.operations).toContain("op_already_exists");
  });

  it("overrides Friendbot to return rate-limit 429", async () => {
    server.use(scenarioHandlers.friendbotRateLimited);

    const res = await fetch(
      `${FRIENDBOT}?addr=${encodeURIComponent(FIXTURE_ACCOUNT_ID)}`
    );
    expect(res.status).toBe(429);
  });

  it("overrides transaction to return 404", async () => {
    server.use(scenarioHandlers.transactionNotFound);

    const res = await fetch(`${TESTNET}/transactions/${FIXTURE_TX_HASH}`);
    expect(res.status).toBe(404);
  });

  it("overrides account to return malformed JSON", async () => {
    server.use(scenarioHandlers.accountMalformedJson);

    const res = await fetch(`${TESTNET}/accounts/${FIXTURE_ACCOUNT_ID}`);
    expect(res.status).toBe(200);

    await expect(res.json()).rejects.toThrow();
  });

  it("overrides account with a delay and still resolves", async () => {
    server.use(scenarioHandlers.accountDelayed);

    const res = await fetch(`${TESTNET}/accounts/${FIXTURE_ACCOUNT_ID}`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.account_id).toBe(FIXTURE_ACCOUNT_ID);
  });
});

// ---------------------------------------------------------------------------
// No live network calls
// ---------------------------------------------------------------------------

describe("network isolation", () => {
  it("throws on a request to an unregistered domain", async () => {
    await expect(fetch("https://example.com/unregistered")).rejects.toThrow();
  });

  it("throws on a request to an unregistered Horizon path", async () => {
    await expect(
      fetch(`${TESTNET}/ledgers/1`)
    ).rejects.toThrow();
  });
});
