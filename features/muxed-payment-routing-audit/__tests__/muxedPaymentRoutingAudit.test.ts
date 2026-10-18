import { describe, expect, it } from "vitest";
import { http, HttpResponse, withMswHandlers } from "@/core/testing/msw";
import { runMuxedPaymentRoutingAudit as run } from "@/features/muxed-payment-routing-audit/lib/muxedPaymentRoutingAudit";
import { handlers, paymentPath, rateLimitedHandler, badCursorHandler, failedHandler, malformedHandler } from "@/features/muxed-payment-routing-audit/msw/handlers";
import { baseAccount, missingAccount, muxedAddress } from "@/features/muxed-payment-routing-audit/fixtures/muxedPaymentRoutingAudit.fixture";
import { directPayments } from "@/features/muxed-payment-routing-audit/fixtures/direct-payments.fixture";
const server = withMswHandlers(...handlers);
describe("payment routing audit", () => {
  it("groups incoming muxed and direct payments and excludes outgoing", async () => {
    const result = await run({ accountId: baseAccount }, "testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.groups.map((g) => [g.destinationId, g.payments.length])).toEqual([[null, 2], ["7", 2], ["9", 1]]);
    expect(result.value.groups[1].totals[0].amount).toBe("9007199254740993.0000002");
    expect(result.value.pagesFetched).toBe(1);
  });
  it("rejects bad input before any request", async () => expect(await run({ accountId: "Sbad" }, "testnet")).toEqual({ ok: false, code: "invalid_account" }));
  it("maps not found, bad cursor, rate limit and server failure", async () => {
    expect(await run({ accountId: missingAccount }, "testnet")).toEqual({ ok: false, code: "account_not_found" });
    for (const [handler, code] of [[badCursorHandler, "invalid_cursor"], [rateLimitedHandler, "rate_limited"], [failedHandler, "request_failed"]] as const) {
      server.use(handler);
      expect(await run({ accountId: baseAccount }, "testnet")).toEqual({ ok: false, code });
      server.resetHandlers();
    }
  });
  it("returns malformed_payment for bad amounts or mismatched IDs", async () => {
    server.use(malformedHandler);
    expect(await run({ accountId: baseAccount }, "testnet")).toEqual({ ok: false, code: "malformed_payment" });
    server.resetHandlers();
    server.use(http.get(paymentPath, () => HttpResponse.json({ _embedded: { records: [{ ...directPayments[0], to_muxed: muxedAddress(7n), to_muxed_id: "8" }] } })));
    expect(await run({ accountId: baseAccount }, "testnet")).toEqual({ ok: false, code: "malformed_payment" });
  });
});
