import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { copy } from "@/features/sep38-quote-viewer/copy";
import { runSep38QuoteViewer } from "@/features/sep38-quote-viewer/lib/sep38QuoteViewer";
import {
  EXPIRES_AT,
  INDICATIVE_PRICE,
  OFF_CHAIN_ASSET,
  ON_CHAIN_ASSET,
  QUOTE_SERVER,
  normalRaw,
  secretSeed,
  tomlMissingQuoteServer
} from "@/features/sep38-quote-viewer/fixtures/sep38QuoteViewer.fixture";
import { supportedPairRaw, SUPPORTED_PRICE } from "@/features/sep38-quote-viewer/fixtures/supported-pair.fixture";
import { unsupportedPairRaw } from "@/features/sep38-quote-viewer/fixtures/unsupported-pair.fixture";
import { handlers, priceNetworkError, tomlHandler } from "@/features/sep38-quote-viewer/msw/handlers";

const server = withMswHandlers(...handlers);

describe("runSep38QuoteViewer", () => {
  it("returns an indicative price for the normal pair", async () => {
    const result = await runSep38QuoteViewer(normalRaw, "testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.indicativeOnly).toBe(true);
    expect(result.value.summary).toBe(copy.summary);
    expect(result.value.quote.price).toBe(INDICATIVE_PRICE);
    expect(result.value.quote.expiresAt).toBe(EXPIRES_AT);
    expect(result.value.sellAsset).toBe(OFF_CHAIN_ASSET);
    expect(result.value.buyAsset).toBe(ON_CHAIN_ASSET);
    expect(result.value.quoteServer).toBe(QUOTE_SERVER);
    expect(result.value.network).toBe("testnet");
    expect(new URL(result.value.priceUrl).pathname.endsWith("/price")).toBe(true);
  });

  it("prices the supported native edge pair", async () => {
    const result = await runSep38QuoteViewer(supportedPairRaw, "mainnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.quote.price).toBe(SUPPORTED_PRICE);
    expect(result.value.sellAsset).toBe("stellar:native");
    expect(result.value.quote.expiresAt).toBeUndefined();
    expect(result.value.network).toBe("mainnet");
  });

  it("keeps an unsupported pair distinct from a missing server or a transport failure", async () => {
    expect(await runSep38QuoteViewer(unsupportedPairRaw, "testnet")).toEqual({
      ok: false,
      code: "unsupported_pair"
    });

    server.use(tomlHandler(tomlMissingQuoteServer));
    expect(await runSep38QuoteViewer(normalRaw, "testnet")).toEqual({
      ok: false,
      code: "missing_quote_server"
    });

    server.use(tomlHandler('ANCHOR_QUOTE_SERVER="https://quote.example/sep38"'), priceNetworkError);
    expect(await runSep38QuoteViewer(normalRaw, "testnet")).toEqual({ ok: false, code: "request_failed" });
  });

  it("validates before any request", async () => {
    let calls = 0;
    const fetchImpl = async () => {
      calls += 1;
      return new Response("nope", { status: 500 });
    };
    const domain = await runSep38QuoteViewer({ ...normalRaw, homeDomain: "not a domain" }, "testnet", {
      fetchImpl
    });
    const secret = await runSep38QuoteViewer(
      { ...normalRaw, onChainAsset: `stellar:USDC:${secretSeed}` },
      "testnet",
      { fetchImpl }
    );
    expect(calls).toBe(0);
    expect(domain).toMatchObject({ ok: false, code: "invalid_home_domain" });
    expect(secret).toMatchObject({ ok: false, code: "invalid_asset", detail: "on_chain" });
    expect(JSON.stringify(secret)).not.toContain(secretSeed);
  });
});
