import { describe, expect, it } from "vitest";
import { http, HttpResponse, withMswHandlers } from "@/core/testing/msw";
import { fetchPaymentPages, PAGE_SIZE, MAX_PAGES } from "@/features/muxed-payment-routing-audit/lib/payment-pages";
import { handlers, paymentPath } from "@/features/muxed-payment-routing-audit/msw/handlers";
import { baseAccount } from "@/features/muxed-payment-routing-audit/fixtures/muxedPaymentRoutingAudit.fixture";
const server = withMswHandlers(...handlers);
describe("bounded payment pages", () => {
  it("fetches one partial page", async () => { const result = await fetchPaymentPages(baseAccount, "testnet"); expect(result.ok && result.value.pagesFetched).toBe(1); });
  it("walks at most three pages by paging token", async () => {
    const cursors: (string | null)[] = [];
    server.use(http.get(paymentPath, ({ request }) => {
      cursors.push(new URL(request.url).searchParams.get("cursor"));
      const offset = cursors.length * PAGE_SIZE;
      return HttpResponse.json({ _embedded: { records: Array.from({ length: PAGE_SIZE }, (_, i) => ({ paging_token: String(1000 - offset - i), type: "account_merge" })) } });
    }));
    const result = await fetchPaymentPages(baseAccount, "testnet");
    expect(result).toMatchObject({ ok: true, value: { pagesFetched: MAX_PAGES, hasMore: true } });
    expect(cursors).toEqual([null, "961", "941"]);
  });
  it("rejects duplicate tokens", async () => {
    server.use(http.get(paymentPath, () => HttpResponse.json({ _embedded: { records: Array.from({ length: PAGE_SIZE }, () => ({ paging_token: "123", type: "payment" })) } })));
    expect(await fetchPaymentPages(baseAccount, "testnet")).toEqual({ ok: false, code: "invalid_cursor" });
  });
  it("rejects a token that moves forward in descending history", async () => {
    server.use(http.get(paymentPath, () => HttpResponse.json({ _embedded: { records: [{ paging_token: "1", type: "payment" }, { paging_token: "2", type: "payment" }] } })));
    expect(await fetchPaymentPages(baseAccount, "testnet")).toEqual({ ok: false, code: "invalid_cursor" });
  });
  it("rejects malformed page shapes", async () => {
    server.use(http.get(paymentPath, () => HttpResponse.json({ _embedded: {} })));
    expect(await fetchPaymentPages(baseAccount, "testnet")).toEqual({ ok: false, code: "malformed_payment" });
  });
});
