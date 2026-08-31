import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { copy } from "@/features/orderbook-viewer/copy";
import { toOrderbookViewerErrorCode } from "@/features/orderbook-viewer/lib/orderbookViewer.errors";
import { assetQuery, parseOrderbookViewerInput } from "@/features/orderbook-viewer/schema";
import type { OrderbookAsset, OrderbookLevel, OrderbookViewerErrorCode, OrderbookViewerInput, OrderbookViewerResult } from "@/features/orderbook-viewer/types";

const AMOUNT_SCALE = 10_000_000n;
const DECIMAL = /^\d+(?:\.\d+)?$/;

interface Rational { n: bigint; d: bigint; }
interface RawLevel { price?: string | { n?: string | number; d?: string | number }; price_r?: { n?: string | number; d?: string | number }; amount?: string; }

function gcd(a: bigint, b: bigint): bigint { let x = a < 0n ? -a : a; let y = b < 0n ? -b : b; while (y) [x, y] = [y, x % y]; return x || 1n; }
function reduce(n: bigint, d: bigint): Rational { if (d < 0n) [n, d] = [-n, -d]; const g = gcd(n, d); return { n: n / g, d: d / g }; }
function compare(a: Rational, b: Rational): number { const left = a.n * b.d; const right = b.n * a.d; return left < right ? -1 : left > right ? 1 : 0; }
function subtract(a: Rational, b: Rational): Rational { return reduce(a.n * b.d - b.n * a.d, a.d * b.d); }
function parseAmount(value: unknown): bigint | null { if (typeof value !== "string" || !/^\d+(?:\.\d{1,7})?$/.test(value)) return null; const [whole, fraction = ""] = value.split("."); return BigInt(whole) * AMOUNT_SCALE + BigInt(fraction.padEnd(7, "0")); }
function formatAmount(value: bigint): string { const whole = value / AMOUNT_SCALE; const fraction = (value % AMOUNT_SCALE).toString().padStart(7, "0").replace(/0+$/, ""); return fraction ? `${whole}.${fraction}` : `${whole}`; }
function decimalRational(value: string): Rational | null { if (!DECIMAL.test(value)) return null; const [whole, fraction = ""] = value.split("."); const denominator = 10n ** BigInt(fraction.length); return reduce(BigInt(whole) * denominator + BigInt(fraction || "0"), denominator); }
function parsePrice(level: RawLevel): Rational | null {
  const raw = level.price_r ?? (typeof level.price === "object" ? level.price : undefined);
  if (raw && raw.n !== undefined && raw.d !== undefined) { try { const n = BigInt(raw.n); const d = BigInt(raw.d); return n > 0n && d > 0n ? reduce(n, d) : null; } catch { return null; } }
  return typeof level.price === "string" ? decimalRational(level.price) : null;
}
function rationalDisplay(value: Rational): string { return `${value.n}/${value.d}`; }
function decimalDisplay(value: Rational): string { const scaled = value.n * 1_000_000n / value.d; const whole = scaled / 1_000_000n; const fraction = (scaled % 1_000_000n).toString().padStart(6, "0").replace(/0+$/, ""); return fraction ? `${whole}.${fraction}` : `${whole}`; }
function levels(raw: unknown, descending: boolean, limit: number): { levels: OrderbookLevel[]; prices: Rational[] } | null {
  if (!Array.isArray(raw) || raw.length > 200) return null;
  const parsed = raw.map((item) => { const level = item as RawLevel; const price = parsePrice(level); const amount = parseAmount(level.amount); return price && amount !== null && price.n > 0n && amount > 0n ? { price, amount } : null; });
  if (parsed.some((item) => item === null)) return null;
  const sorted = (parsed as { price: Rational; amount: bigint }[]).sort((a, b) => descending ? -compare(a.price, b.price) : compare(a.price, b.price)).slice(0, limit);
  let total = 0n;
  return { levels: sorted.map((entry) => { total += entry.amount; return { price: rationalDisplay(entry.price), priceNumerator: entry.price.n.toString(), priceDenominator: entry.price.d.toString(), priceDecimal: decimalDisplay(entry.price), amount: formatAmount(entry.amount), total: formatAmount(total) }; }), prices: sorted.map((entry) => entry.price) };
}
function requestError(status: number): Error & { status: number } { return Object.assign(new Error("Horizon request failed."), { status }); }

function requestFromInput(input: OrderbookViewerInput): Result<{ selling: OrderbookAsset; buying: OrderbookAsset; limit: number }, OrderbookViewerErrorCode> {
  if (input.selling && input.buying) {
    const parsed = parseOrderbookViewerInput(JSON.stringify({ selling: input.selling, buying: input.buying, limit: input.limit ?? 20 }));
    return parsed.ok ? ok({ selling: parsed.value.selling!, buying: parsed.value.buying!, limit: parsed.value.limit ?? 20 }) : parsed;
  }
  if (!input.value?.trim()) return err("empty_selling_asset");
  const parsed = parseOrderbookViewerInput(input.value);
  return parsed.ok ? ok({ selling: parsed.value.selling!, buying: parsed.value.buying!, limit: parsed.value.limit ?? 20 }) : parsed;
}

/** Loads Horizon's order book and retains price_r as exact rational data. */
export async function runOrderbookViewer(input: OrderbookViewerInput, network: StellarNetwork, signal?: AbortSignal): Promise<Result<OrderbookViewerResult, OrderbookViewerErrorCode>> {
  const request = requestFromInput(input);
  if (!request.ok) return request;
  try {
    const query = { ...assetQuery(request.value.selling, "selling"), ...assetQuery(request.value.buying, "buying"), limit: String(request.value.limit) };
    const response = await fetch(horizonUrl(network, "/order_book", query), { signal, headers: { Accept: "application/json" } });
    if (!response.ok) throw requestError(response.status);
    const payload = await response.json() as { bids?: unknown; asks?: unknown };
    const bidData = levels(payload.bids, true, request.value.limit);
    const askData = levels(payload.asks, false, request.value.limit);
    if (!bidData || !askData) return err("request_failed");
    const empty = bidData.levels.length === 0 || askData.levels.length === 0;
    const bestBid = bidData.prices[0];
    const bestAsk = askData.prices[0];
    const spread = bestBid && bestAsk ? subtract(bestAsk, bestBid) : null;
    const mid = bestBid && bestAsk ? reduce(bestBid.n * bestAsk.d + bestAsk.n * bestBid.d, 2n * bestBid.d * bestAsk.d) : null;
    const bidDepth = bidData.levels.length ? parseAmount(bidData.levels[Math.min(4, bidData.levels.length - 1)]!.total)! : 0n;
    const askDepth = askData.levels.length ? parseAmount(askData.levels[Math.min(4, askData.levels.length - 1)]!.total)! : 0n;
    const totalDepth = bidDepth + askDepth;
    const imbalanceBps = totalDepth ? (bidDepth - askDepth) * 10_000n / totalDepth : 0n;
    const spreadPercentBps = spread && bestBid ? spread.n * 10_000n * bestBid.d / (spread.d * bestBid.n) : 0n;
    return ok({ selling: request.value.selling, buying: request.value.buying, bids: bidData.levels, asks: askData.levels, bestBid: bestBid ? rationalDisplay(bestBid) : copy.notAvailable, bestAsk: bestAsk ? rationalDisplay(bestAsk) : copy.notAvailable, spread: spread ? rationalDisplay(spread) : copy.notAvailable, spreadPercent: spread ? `${(Number(spreadPercentBps) / 100).toFixed(2)}%` : copy.notAvailable, midPrice: mid ? rationalDisplay(mid) : copy.notAvailable, imbalancePercent: `${(Number(imbalanceBps) / 100).toFixed(2)}%`, empty, emptyReason: empty ? copy.noLiquidityDescription : undefined, network });
  } catch (error) {
    return err(toOrderbookViewerErrorCode(error));
  }
}

export { formatAmount, parseAmount, parsePrice, rationalDisplay };
