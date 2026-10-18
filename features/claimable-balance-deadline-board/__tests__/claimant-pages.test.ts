import { describe, expect, it } from "vitest";
import { withMswHandlers, http, HttpResponse } from "@/core/testing/msw";
import { CursorProgressError, PageDecodeError, fetchClaimantPages } from "../lib/claimant-pages";
import { claimant } from "../fixtures/claimableBalanceDeadlineBoard.fixture";
import { fullPage } from "../fixtures/claimant-balances.fixture";
import { handlers } from "../msw/handlers";
const server = withMswHandlers(...handlers);
describe("bounded claimant pagination", () => {
  it("reports one actual page for a short response", async () => {
    const result = await fetchClaimantPages({ claimant }, "testnet");
    expect(result.pagesFetched).toBe(1);
    expect(result.limitReached).toBe(false);
  });
  it("stops at three pages and exposes the final cursor", async () => {
    const result = await fetchClaimantPages({ claimant, cursor: "900" }, "testnet");
    expect(result.pagesFetched).toBe(3);
    expect(result.limitReached).toBe(true);
    expect(result.nextCursor).toBe("1600");
  });
  it("advances cursor, deduplicates paging tokens and reports two pages", async () => {
    const result = await fetchClaimantPages({ claimant, cursor: "0" }, "testnet");
    expect(result.pagesFetched).toBe(2);
    expect(result.nextCursor).toBe("201");
    expect(result.records).toHaveLength(201);
    expect(result.records.at(-1)?.paging_token).toBe("201");
  });
  it("rejects a full page whose cursor cannot advance", async () => {
    server.use(http.get("https://horizon-testnet.stellar.org/claimable_balances", () =>
      HttpResponse.json({ _embedded: { records: fullPage } })));
    await expect(fetchClaimantPages({ claimant, cursor: "200" }, "testnet"))
      .rejects.toBeInstanceOf(CursorProgressError);
  });
  it("rejects a short page that moves backward from the requested cursor", async () => {
    server.use(http.get("https://horizon-testnet.stellar.org/claimable_balances", () =>
      HttpResponse.json({ _embedded: { records: [fullPage[0]] } })));
    await expect(fetchClaimantPages({ claimant, cursor: "200" }, "testnet"))
      .rejects.toBeInstanceOf(CursorProgressError);
  });
  it("rejects records returned out of ascending paging order", async () => {
    server.use(http.get("https://horizon-testnet.stellar.org/claimable_balances", () =>
      HttpResponse.json({ _embedded: { records: [fullPage[1], fullPage[0]] } })));
    await expect(fetchClaimantPages({ claimant }, "testnet"))
      .rejects.toBeInstanceOf(CursorProgressError);
  });
  it.each([
    [{ ...fullPage[0], paging_token: "not-a-token" }],
    [{ ...fullPage[0], claimants: [null] }],
    [{ ...fullPage[0], claimants: [{ destination: claimant }] }]
  ])("rejects malformed Horizon records instead of silently omitting balances", async (record) => {
    server.use(http.get("https://horizon-testnet.stellar.org/claimable_balances", () =>
      HttpResponse.json({ _embedded: { records: [record] } })));
    await expect(fetchClaimantPages({ claimant }, "testnet")).rejects.toBeInstanceOf(PageDecodeError);
  });
  it("rejects a response larger than the requested page size", async () => {
    server.use(http.get("https://horizon-testnet.stellar.org/claimable_balances", () =>
      HttpResponse.json({ _embedded: { records: [...fullPage, fullPage[0]] } })));
    await expect(fetchClaimantPages({ claimant }, "testnet")).rejects.toBeInstanceOf(PageDecodeError);
  });
});
