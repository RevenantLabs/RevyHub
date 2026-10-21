import { err, ok, type Result } from "@/core/result/result";
import {
  containsSecretKey,
  positiveDecimal
} from "@/features/sep38-quote-viewer/lib/asset-pair-fields";
import { getPublic, type QuoteFetchOptions } from "@/features/sep38-quote-viewer/lib/sep38QuoteViewer.errors";
import type { IndicativePrice, Sep38QuoteViewerErrorCode } from "@/features/sep38-quote-viewer/types";

const DECIMAL = /^(?:0|[1-9]\d*)(?:\.\d{1,18})?$/;
const RFC3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const UNSUPPORTED = /unsupported|not support|does not support|unknown asset|no market|asset pair/i;

export interface IndicativePriceRequest {
  quoteServer: string;
  sellAsset: string;
  buyAsset: string;
  sellAmount: string;
}

export interface IndicativePriceFetch {
  quote: IndicativePrice;
  priceUrl: string;
}

export function buildIndicativePriceUrl(
  quoteServer: string,
  sellAsset: string,
  buyAsset: string,
  sellAmount: string
): Result<string, "request_failed"> {
  let base: URL;
  try {
    base = new URL(quoteServer);
  } catch {
    return err("request_failed");
  }
  if (base.protocol !== "https:") return err("request_failed");

  const price = new URL("price", base.href.endsWith("/") ? base.href : `${base.href}/`);
  if (!price.pathname.endsWith("/price")) return err("request_failed");
  price.searchParams.set("sell_asset", sellAsset);
  price.searchParams.set("buy_asset", buyAsset);
  price.searchParams.set("sell_amount", sellAmount);
  return ok(price.toString());
}

function isDecimal(value: unknown): value is string {
  return typeof value === "string" && DECIMAL.test(value);
}

function isUnsupported(parsed: unknown, raw: string): boolean {
  if (parsed && typeof parsed === "object") {
    const record = parsed as Record<string, unknown>;
    if (record.type === "unsupported_pair") return true;
    if (typeof record.error === "string" && UNSUPPORTED.test(record.error)) return true;
  }
  return UNSUPPORTED.test(raw);
}

/**
 * Decode a GET /price body. An unsupported pair is not a transport failure,
 * and a JSON number is refused so the price never passes through a float.
 */
export function parseIndicativePriceBody(
  status: number,
  raw: string
): Result<IndicativePrice, "unsupported_pair" | "request_failed"> {
  let parsed: unknown = null;
  const text = raw.trim();
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      if ((status === 400 || status === 404 || status === 422) && isUnsupported(null, text)) {
        return err("unsupported_pair");
      }
      return err("request_failed");
    }
  }

  if (status === 400 || status === 404 || status === 422) {
    return isUnsupported(parsed, text) ? err("unsupported_pair") : err("request_failed");
  }
  if (status !== 200 || !parsed || typeof parsed !== "object") return err("request_failed");

  const record = parsed as Record<string, unknown>;
  if (!isDecimal(record.price)) return err("request_failed");

  const quote: IndicativePrice = { price: record.price };
  if (record.sell_amount !== undefined) {
    if (!isDecimal(record.sell_amount)) return err("request_failed");
    quote.sellAmount = record.sell_amount;
  }
  if (record.buy_amount !== undefined) {
    if (!isDecimal(record.buy_amount)) return err("request_failed");
    quote.buyAmount = record.buy_amount;
  }
  if (record.expires_at !== undefined) {
    if (typeof record.expires_at !== "string" || !RFC3339.test(record.expires_at)) {
      return err("request_failed");
    }
    if (Number.isNaN(Date.parse(record.expires_at))) return err("request_failed");
    quote.expiresAt = record.expires_at;
  }
  if (record.fee !== undefined) {
    if (!record.fee || typeof record.fee !== "object") return err("request_failed");
    const fee = record.fee as Record<string, unknown>;
    if (!isDecimal(fee.total) || typeof fee.asset !== "string" || fee.asset.trim() === "") {
      return err("request_failed");
    }
    if (containsSecretKey(fee.asset)) return err("request_failed");
    quote.feeTotal = fee.total;
    quote.feeAsset = fee.asset;
  }

  return ok(quote);
}

/**
 * GET {quote server}/price. This is the public indicative endpoint only.
 * Firm quotes are a different, authenticated SEP-38 call and are never made.
 */
export async function fetchIndicativePrice(
  request: IndicativePriceRequest,
  options: QuoteFetchOptions = {}
): Promise<Result<IndicativePriceFetch, Sep38QuoteViewerErrorCode>> {
  if (
    containsSecretKey(request.sellAsset) ||
    containsSecretKey(request.buyAsset) ||
    containsSecretKey(request.sellAmount) ||
    containsSecretKey(request.quoteServer)
  ) {
    return err("invalid_asset");
  }
  if (!positiveDecimal(request.sellAmount)) return err("invalid_amount", "amount");

  const priceUrl = buildIndicativePriceUrl(
    request.quoteServer,
    request.sellAsset,
    request.buyAsset,
    request.sellAmount
  );
  if (!priceUrl.ok) return priceUrl;

  const response = await getPublic(priceUrl.value, { ...options, accept: "application/json" });
  if (!response.ok) return response;

  const quote = parseIndicativePriceBody(response.value.status, response.value.body);
  if (!quote.ok) return quote;
  return ok({ quote: quote.value, priceUrl: priceUrl.value });
}
