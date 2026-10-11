import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import {
  deduplicateOffers,
  loadMoreOffers,
  normalizeOfferAsset,
  normalizeOfferRecord,
  runOfferInspector
} from "@/features/offer-inspector/lib/offerInspector";
import {
  handlers,
  rateLimitedHandler,
  serverErrorHandler
} from "@/features/offer-inspector/msw/handlers";
import {
  accountId,
  emptyOffersAccountId,
  issuerId,
  rawOfferRecord1,
  rawOfferRecord2,
  unknownAccountId
} from "@/features/offer-inspector/fixtures/offerInspector.fixture";

const server = withMswHandlers(...handlers);

describe("normalizeOfferAsset", () => {
  it("normalizes native asset as XLM", () => {
    const result = normalizeOfferAsset({ asset_type: "native" });
    expect(result).toEqual({
      isNative: true,
      code: "XLM",
      label: "XLM (native)"
    });
  });

  it("normalizes credit asset with issuer", () => {
    const result = normalizeOfferAsset({
      asset_type: "credit_alphanum4",
      asset_code: "USDC",
      asset_issuer: issuerId
    });
    expect(result).toEqual({
      isNative: false,
      code: "USDC",
      issuer: issuerId,
      label: `USDC:${issuerId}`
    });
  });
});

describe("normalizeOfferRecord", () => {
  it("preserves IDs and amounts as strings without float precision loss", () => {
    const result = normalizeOfferRecord(rawOfferRecord1 as never);
    expect(result.id).toBe("20001");
    expect(typeof result.id).toBe("string");
    expect(result.amount).toBe("100.0000000");
    expect(result.price).toBe("0.5000000");
    expect(result.priceFraction).toEqual({ n: 1, d: 2 });
  });
});

describe("deduplicateOffers", () => {
  it("deduplicates offers by ID preserving order", () => {
    const offerA = normalizeOfferRecord(rawOfferRecord1 as never);
    const offerB = normalizeOfferRecord(rawOfferRecord2 as never);
    const deduplicated = deduplicateOffers([offerA, offerB, offerA]);
    expect(deduplicated).toHaveLength(2);
    expect(deduplicated[0].id).toBe("20001");
    expect(deduplicated[1].id).toBe("20002");
  });
});

describe("runOfferInspector", () => {
  it("returns open offers, ledger sequence, and reserve requirements for valid account", async () => {
    resetHorizonClients();
    const result = await runOfferInspector({ accountId }, "testnet");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.offers).toHaveLength(2);
    expect(result.value.offers[0].id).toBe("20001");
    expect(result.value.offers[0].selling.code).toBe("XLM");
    expect(result.value.offers[0].buying.code).toBe("USDC");
    expect(result.value.offers[0].priceFraction).toEqual({ n: 1, d: 2 });
    expect(result.value.grossReserveUnits).toBe(2);
    expect(result.value.baseReserveXlm).toBe("0.5");
    expect(result.value.grossReserveXlm).toBe("1");
    expect(result.value.latestLedgerSequence).toBe(1_234_567);
  });

  it("handles an account with zero open offers distinct from missing account", async () => {
    resetHorizonClients();
    const result = await runOfferInspector(
      { accountId: emptyOffersAccountId },
      "testnet"
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.offers).toHaveLength(0);
    expect(result.value.loadedOffersCount).toBe(0);
    expect(result.value.grossReserveUnits).toBe(0);
    expect(result.value.grossReserveXlm).toBe("0");
  });

  it("maps 404 to account_not_found", async () => {
    resetHorizonClients();
    const result = await runOfferInspector({ accountId: unknownAccountId }, "testnet");
    expect(result).toEqual({ ok: false, code: "account_not_found" });
  });

  it("maps 429 to rate_limited", async () => {
    server.use(rateLimitedHandler);
    resetHorizonClients();
    const result = await runOfferInspector({ accountId }, "testnet");
    expect(result).toEqual({ ok: false, code: "rate_limited" });
  });

  it("maps 500 to request_failed", async () => {
    server.use(serverErrorHandler);
    resetHorizonClients();
    const result = await runOfferInspector({ accountId }, "testnet");
    expect(result).toEqual({ ok: false, code: "request_failed" });
  });
});

describe("loadMoreOffers", () => {
  it("paginates using cursor and merges without duplicate entries", async () => {
    resetHorizonClients();
    const page1 = await runOfferInspector({ accountId, limit: 1 }, "testnet");
    expect(page1.ok).toBe(true);
    if (!page1.ok) return;

    expect(page1.value.offers).toHaveLength(1);
    expect(page1.value.isPartial).toBe(true);
    expect(page1.value.nextCursor).toBe("20001");

    const page2 = await loadMoreOffers(page1.value);
    expect(page2.ok).toBe(true);
    if (!page2.ok) return;

    expect(page2.value.offers).toHaveLength(2);
    expect(page2.value.offers[0].id).toBe("20001");
    expect(page2.value.offers[1].id).toBe("20002");
    expect(page2.value.grossReserveUnits).toBe(2);
    expect(page2.value.grossReserveXlm).toBe("1");
  });
});

