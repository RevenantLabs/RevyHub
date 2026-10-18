import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { http, HttpResponse } from "msw";
import { decodeOperationPage, loadNextActivityPage, runAccountActivityRollup } from "@/features/account-activity-rollup/lib/accountActivityRollup";
import { handlers, badCursorHandler, rateLimitedHandler, stalledPageHandler } from "@/features/account-activity-rollup/msw/handlers";
import { accountId, emptyAccountId, unknownAccountId, unavailableAccountId, malformedAccountId } from "@/features/account-activity-rollup/fixtures/accountActivityRollup.fixture";

const server = withMswHandlers(...handlers);
const input = { accountId };
const base = `https://horizon-testnet.stellar.org/accounts/${accountId}/operations`;

describe("account activity rollup", () => {
  it("fetches, aggregates, deduplicates, and counts pages", async () => {
    const initial = await runAccountActivityRollup(input, "testnet");
    expect(initial.ok).toBe(true);
    if (!initial.ok) return;
    expect(initial.value.coverage).toMatchObject({ pages: 1, records: 20, hasMore: true });
    const next = await loadNextActivityPage(initial.value, "testnet");
    expect(next.ok).toBe(true);
    if (!next.ok) return;
    expect(next.value.coverage).toMatchObject({ pages: 2, records: 22, hasMore: false });
    expect(next.value.byType).toEqual([{ key: "payment", count: 20 }, { key: "change_trust", count: 2 }]);
    expect(next.value.byDay.map((day) => day.key)).toEqual(["2024-01-16", "2024-01-15", "2024-01-14"]);
  });
  it("separates empty activity from missing accounts", async () => {
    const empty = await runAccountActivityRollup({ accountId: emptyAccountId }, "testnet");
    expect(empty.ok && empty.value.coverage.records).toBe(0);
    expect(await runAccountActivityRollup({ accountId: unknownAccountId }, "testnet")).toEqual({ ok: false, code: "account_not_found" });
  });
  it("maps unavailable and malformed history", async () => {
    expect(await runAccountActivityRollup({ accountId: unavailableAccountId }, "testnet")).toEqual({ ok: false, code: "history_unavailable" });
    expect(await runAccountActivityRollup({ accountId: malformedAccountId }, "testnet")).toEqual({ ok: false, code: "history_unavailable" });
    expect(decodeOperationPage({ _embedded: {} })).toEqual({ ok: false, code: "history_unavailable" });
  });
  it("normalizes ledger timestamps to UTC before day grouping", () => {
    expect(decodeOperationPage({ _embedded: { records: [{ paging_token: "5", type: "payment", created_at: "2024-01-15T23:30:00-01:00" }] } })).toEqual({
      ok: true, value: [{ pagingToken: "5", type: "payment", createdAt: "2024-01-16T00:30:00.000Z" }]
    });
    expect(decodeOperationPage({ _embedded: { records: [{ paging_token: "5", type: "payment", created_at: "2024-01-15T23:30:00" }] } })).toEqual({ ok: false, code: "history_unavailable" });
  });
  it("maps bad cursors and rate limits", async () => {
    const initial = await runAccountActivityRollup(input, "testnet");
    if (!initial.ok) throw new Error("fixture failed");
    server.use(badCursorHandler);
    expect(await loadNextActivityPage(initial.value, "testnet")).toEqual({ ok: false, code: "invalid_cursor" });
    server.use(rateLimitedHandler);
    expect(await runAccountActivityRollup(input, "testnet")).toEqual({ ok: false, code: "rate_limited" });
  });
  it("stops if a full page repeats its cursor", async () => {
    const initial = await runAccountActivityRollup(input, "testnet");
    if (!initial.ok) throw new Error("fixture failed");
    server.use(stalledPageHandler);
    const next = await loadNextActivityPage(initial.value, "testnet");
    expect(next.ok && next.value.cursor).toBeNull();
    expect(next.ok && next.value.coverage.pages).toBe(2);
  });
  it("stops after a full replay even when its last token differs from the requested cursor", async () => {
    const initial = await runAccountActivityRollup(input, "testnet");
    if (!initial.ok) throw new Error("fixture failed");
    server.use(http.get(base, ({ request }) => new URL(request.url).searchParams.has("cursor")
      ? HttpResponse.json({ _embedded: { records: Array.from({ length: 20 }, () => ({ paging_token: "82", type: "payment", created_at: "2024-01-15T12:00:00Z" })) } })
      : undefined));
    const next = await loadNextActivityPage(initial.value, "testnet");
    expect(next.ok && next.value.cursor).toBeNull();
    expect(next.ok && next.value.coverage).toMatchObject({ pages: 2, records: 20, hasMore: false });
  });
  it("rejects a secret account and malformed cursor before pagination", async () => {
    const initial = await runAccountActivityRollup(input, "testnet");
    if (!initial.ok) throw new Error("fixture failed");
    expect(await loadNextActivityPage({ ...initial.value, accountId: "Snot-a-public-address" }, "testnet")).toEqual({ ok: false, code: "invalid_account" });
    expect(await loadNextActivityPage({ ...initial.value, cursor: "81&limit=200" }, "testnet")).toEqual({ ok: false, code: "invalid_cursor" });
  });
  it("maps transport and server failures to request_failed", async () => {
    server.use(http.get(base, () => HttpResponse.json({}, { status: 500 })));
    expect(await runAccountActivityRollup(input, "testnet")).toEqual({ ok: false, code: "request_failed" });
  });
  it("rejects invalid accounts before transport", async () => {
    expect(await runAccountActivityRollup({ accountId: "bad" }, "testnet")).toEqual({ ok: false, code: "invalid_account" });
  });
});
