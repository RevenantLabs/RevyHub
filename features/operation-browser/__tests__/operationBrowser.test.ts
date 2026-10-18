import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import {
  fetchOperationPage,
  loadNewerOperationPage,
  loadOlderOperationPage,
  normalizeHorizonOperation,
  pageHasMoreOlder,
  runOperationBrowser
} from "@/features/operation-browser/lib/operationBrowser";
import { handlers, rateLimitedHandler } from "@/features/operation-browser/msw/handlers";
import {
  accountId,
  multiPageFixture,
  pageOneCursor,
  pageOneOperations,
  pageOneRecords,
  pageTwoOperations,
  unknownAccountId
} from "@/features/operation-browser/fixtures/operationBrowser.fixture";

const server = withMswHandlers(...handlers);

describe("normalizeHorizonOperation", () => {
  it("maps payment fields into plain parameters", () => {
    const summary = normalizeHorizonOperation(pageOneRecords[0]!);
    expect(summary.type).toBe("payment");
    expect(summary.params.some((param) => param.label === "Amount")).toBe(true);
    expect(summary.transactionHash).toBeTruthy();
  });

  it("maps change_trust fields into plain parameters", () => {
    const summary = normalizeHorizonOperation(pageOneRecords[1]!);
    expect(summary.params.some((param) => param.label === "Asset" && param.value.includes("USDC"))).toBe(
      true
    );
  });
});

describe("pageHasMoreOlder", () => {
  it("returns true only for a full page", () => {
    expect(pageHasMoreOlder(pageOneOperations)).toBe(true);
  });
});

describe("fetchOperationPage", () => {
  it("loads the newest page from Horizon", async () => {
    resetHorizonClients();
    const page = await fetchOperationPage(accountId, "testnet");
    expect(page.operations).toHaveLength(20);
    expect(page.operations[0]?.type).toBe("payment");
  });

  it("loads the next page with a cursor", async () => {
    resetHorizonClients();
    const page = await fetchOperationPage(accountId, "testnet", pageOneCursor);
    expect(page.operations).toHaveLength(1);
    expect(page.operations[0]?.transactionSuccessful).toBe(false);
  });
});

describe("runOperationBrowser", () => {
  it("returns the first page for a valid account", async () => {
    resetHorizonClients();
    const result = await runOperationBrowser({ accountId }, "testnet");
    expect(result.ok && result.value.pages[0]).toHaveLength(20);
  });

  it("maps a missing account to account_not_found", async () => {
    resetHorizonClients();
    const result = await runOperationBrowser({ accountId: unknownAccountId }, "testnet");
    expect(result).toEqual({ ok: false, code: "account_not_found" });
  });

  it("maps rate limits to rate_limited", async () => {
    server.use(rateLimitedHandler);
    resetHorizonClients();
    const result = await runOperationBrowser({ accountId }, "testnet");
    expect(result).toEqual({ ok: false, code: "rate_limited" });
  });
});

describe("loadOlderOperationPage", () => {
  it("appends the next page when moving beyond cached pages", async () => {
    resetHorizonClients();
    const initial = {
      accountId,
      pages: [pageOneOperations],
      pageIndex: 0,
      hasMoreOlder: true,
      typeFilter: "all"
    };

    const result = await loadOlderOperationPage(initial, "testnet");
    expect(result.ok && result.value.pages).toHaveLength(2);
    expect(result.ok && result.value.pageIndex).toBe(1);
    expect(result.ok && result.value.pages[1]).toEqual(pageTwoOperations);
  });

  it("reuses cached pages without another request", async () => {
    const result = loadNewerOperationPage(multiPageFixture);
    expect(result.pageIndex).toBe(0);
  });
});
