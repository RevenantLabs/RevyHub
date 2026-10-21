import { err, ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { copy } from "@/features/sep38-quote-viewer/copy";
import { fetchIndicativePrice } from "@/features/sep38-quote-viewer/lib/indicative-price-fetch";
import { resolveQuoteServer } from "@/features/sep38-quote-viewer/lib/quote-server-resolve";
import type { QuoteFetchOptions } from "@/features/sep38-quote-viewer/lib/sep38QuoteViewer.errors";
import { toSep38QuoteViewerErrorCode } from "@/features/sep38-quote-viewer/lib/sep38QuoteViewer.errors";
import { parseSep38QuoteViewerInput } from "@/features/sep38-quote-viewer/schema";
import type {
  Sep38QuoteViewerErrorCode,
  Sep38QuoteViewerRawInput,
  Sep38QuoteViewerResult
} from "@/features/sep38-quote-viewer/types";

/**
 * Validate, resolve ANCHOR_QUOTE_SERVER, then read one indicative price.
 * Expected failures stay in the Result. The pathname is always /price.
 */
export async function runSep38QuoteViewer(
  raw: Sep38QuoteViewerRawInput,
  network: StellarNetwork,
  options: QuoteFetchOptions = {}
): Promise<Result<Sep38QuoteViewerResult, Sep38QuoteViewerErrorCode>> {
  const parsed = parseSep38QuoteViewerInput(raw);
  if (!parsed.ok) return parsed;

  try {
    const resolved = await resolveQuoteServer(parsed.value.homeDomain, options);
    if (!resolved.ok) return resolved;

    const price = await fetchIndicativePrice(
      {
        quoteServer: resolved.value.quoteServer,
        sellAsset: parsed.value.sellAsset,
        buyAsset: parsed.value.buyAsset,
        sellAmount: parsed.value.sellAmount
      },
      options
    );
    if (!price.ok) return price;

    const pathname = new URL(price.value.priceUrl).pathname;
    if (!pathname.endsWith("/price")) return err("request_failed");

    return ok({
      summary: copy.summary,
      homeDomain: resolved.value.homeDomain,
      tomlUrl: resolved.value.tomlUrl,
      quoteServer: resolved.value.quoteServer,
      priceUrl: price.value.priceUrl,
      sellAsset: parsed.value.sellAsset,
      buyAsset: parsed.value.buyAsset,
      offChain: parsed.value.offChain,
      onChain: parsed.value.onChain,
      sellSide: parsed.value.sellSide,
      sellAmount: parsed.value.sellAmount,
      quote: price.value.quote,
      network,
      indicativeOnly: true
    });
  } catch (error) {
    return err(toSep38QuoteViewerErrorCode(error));
  }
}
