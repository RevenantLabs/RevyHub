import { describe, expect, it } from "vitest";
import { fetchSep24Transaction } from "@/features/sep24-transaction-status-tracker/lib/sep24-status-fetch";
import {
  liveToken,
  pendingDeposit,
  transactionId,
  transferServer
} from "@/features/sep24-transaction-status-tracker/fixtures/sep24TransactionStatusTracker.fixture";

function respond(status: number, body?: unknown): typeof fetch {
  return (async (_url, init) => {
    const headers = new Headers(init?.headers);
    expect(headers.get("Authorization")).toBe(`Bearer ${liveToken}`);
    return new Response(body === undefined ? "" : JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" }
    });
  }) as typeof fetch;
}

describe("fetchSep24Transaction", () => {
  it("reads a pending deposit and does not return the token", async () => {
    const result = await fetchSep24Transaction(transferServer, transactionId, liveToken, respond(200, pendingDeposit));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.status).toBe("pending_external");
    expect(JSON.stringify(result.value)).not.toContain(liveToken);
  });

  it("keeps a refused token distinct from a missing transaction", async () => {
    expect(await fetchSep24Transaction(transferServer, transactionId, liveToken, respond(401))).toEqual({
      ok: false,
      code: "unauthorized"
    });
    expect(await fetchSep24Transaction(transferServer, transactionId, liveToken, respond(404))).toEqual({
      ok: false,
      code: "transaction_not_found"
    });
  });
});
