import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import {
  BUY_AMOUNT,
  EXPIRES_AT,
  FEE_TOTAL,
  INDICATIVE_PRICE,
  OFF_CHAIN_ASSET,
  ON_CHAIN_ASSET,
  QUOTE_SERVER,
  SELL_AMOUNT,
  priceBody,
  secretSeed
} from "@/features/sep38-quote-viewer/fixtures/sep38QuoteViewer.fixture";
import {
  SUPPORTED_AMOUNT,
  SUPPORTED_OFF_CHAIN,
  SUPPORTED_ON_CHAIN,
  SUPPORTED_PRICE
} from "@/features/sep38-quote-viewer/fixtures/supported-pair.fixture";
import { UNSUPPORTED_ERROR } from "@/features/sep38-quote-viewer/fixtures/unsupported-pair.fixture";
import { handlers, priceDecodeError, priceNetworkError } from "@/features/sep38-quote-viewer/msw/handlers";
import {
  buildIndicativePriceUrl,
  fetchIndicativePrice,
  parseIndicativePriceBody
} from "@/features/sep38-quote-viewer/lib/indicative-price-fetch";

const server = withMswHandlers(...handlers);

const request = {
  quoteServer: QUOTE_SERVER,
  sellAsset: OFF_CHAIN_ASSET,
  buyAsset: ON_CHAIN_ASSET,
  sellAmount: SELL_AMOUNT
};

describe("parseIndicativePriceBody", () => {
  it("keeps price, amounts, fee, and expiration as strings", () => {
    const result = parseIndicativePriceBody(200, JSON.stringify(priceBody));
    expect(result).toEqual({
      ok: true,
      value: {
        price: INDICATIVE_PRICE,
        sellAmount: SELL_AMOUNT,
        buyAmount: BUY_AMOUNT,
        expiresAt: EXPIRES_AT,
        feeTotal: FEE_TOTAL,
        feeAsset: OFF_CHAIN_ASSET
      }
    });
  });

  it("separates an unsupported pair from a decode or numeric price", () => {
    expect(parseIndicativePriceBody(400, JSON.stringify({ error: UNSUPPORTED_ERROR }))).toEqual({
      ok: false,
      code: "unsupported_pair"
    });
    expect(parseIndicativePriceBody(500, JSON.stringify({ error: "upstream timeout" }))).toEqual({
      ok: false,
      code: "request_failed"
    });
    expect(parseIndicativePriceBody(200, "<html></html>")).toEqual({ ok: false, code: "request_failed" });
    expect(parseIndicativePriceBody(200, JSON.stringify({ price: 1.25 }))).toEqual({
      ok: false,
      code: "request_failed"
    });
  });
});

describe("fetchIndicativePrice", () => {
  it("requests GET /price and never a firm quote path", async () => {
    const built = buildIndicativePriceUrl(QUOTE_SERVER, OFF_CHAIN_ASSET, ON_CHAIN_ASSET, SELL_AMOUNT);
    expect(built.ok).toBe(true);
    if (!built.ok) return;
    const url = new URL(built.value);
    expect(url.pathname).toBe("/sep38/price");
    expect(url.pathname.endsWith("/quote")).toBe(false);

    const result = await fetchIndicativePrice(request);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.quote.price).toBe(INDICATIVE_PRICE);
    expect(new URL(result.value.priceUrl).pathname.endsWith("/price")).toBe(true);
  });

  it("loads the native edge pair and classifies unsupported, network, and decode failures", async () => {
    const edge = await fetchIndicativePrice({
      quoteServer: QUOTE_SERVER,
      sellAsset: SUPPORTED_ON_CHAIN,
      buyAsset: SUPPORTED_OFF_CHAIN,
      sellAmount: SUPPORTED_AMOUNT
    });
    expect(edge.ok && edge.value.quote.price).toBe(SUPPORTED_PRICE);
    expect(edge.ok && edge.value.quote.expiresAt).toBeUndefined();

    const unsupported = await fetchIndicativePrice({
      ...request,
      sellAsset: "iso4217:ZAR",
      sellAmount: "10"
    });
    expect(unsupported).toEqual({ ok: false, code: "unsupported_pair" });

    server.use(priceNetworkError);
    expect(await fetchIndicativePrice(request)).toEqual({ ok: false, code: "request_failed" });

    server.use(priceDecodeError);
    expect(await fetchIndicativePrice(request)).toEqual({ ok: false, code: "request_failed" });
  });

  it("does not call the network for a secret or a zero amount", async () => {
    let calls = 0;
    const fetchImpl = async () => {
      calls += 1;
      return new Response("{}", { status: 200 });
    };
    const secret = await fetchIndicativePrice(
      { ...request, sellAsset: secretSeed },
      { fetchImpl }
    );
    const zero = await fetchIndicativePrice({ ...request, sellAmount: "0" }, { fetchImpl });
    expect(calls).toBe(0);
    expect(secret).toEqual({ ok: false, code: "invalid_asset" });
    expect(JSON.stringify(secret)).not.toContain(secretSeed);
    expect(zero).toMatchObject({ ok: false, code: "invalid_amount", detail: "amount" });
  });
});
