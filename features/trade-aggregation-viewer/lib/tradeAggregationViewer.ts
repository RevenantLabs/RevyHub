import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { copy } from "@/features/trade-aggregation-viewer/copy";
import { toTradeAggregationViewerErrorCode } from "@/features/trade-aggregation-viewer/lib/tradeAggregationViewer.errors";
import { assetQuery, parseTradeAggregationViewerInput } from "@/features/trade-aggregation-viewer/schema";
import type { ExactPrice, TradeAggregationAsset, TradeAggregationBucket, TradeAggregationViewerErrorCode, TradeAggregationViewerInput, TradeAggregationViewerResult } from "@/features/trade-aggregation-viewer/types";

const AMOUNT_SCALE = 10_000_000n;
const DECIMAL = /^\d+(?:\.\d+)?$/;
interface Rational { n: bigint; d: bigint; }
interface RawAggregation extends Record<string, unknown> { timestamp?: number | string; trade_count?: number | string; base_volume?: string; counter_volume?: string; open?: string; high?: string; low?: string; close?: string; open_r?: { n?: string | number; d?: string | number }; high_r?: { n?: string | number; d?: string | number }; low_r?: { n?: string | number; d?: string | number }; close_r?: { n?: string | number; d?: string | number }; }
function gcd(a: bigint, b: bigint): bigint { let x = a < 0n ? -a : a; let y = b < 0n ? -b : b; while (y) [x, y] = [y, x % y]; return x || 1n; }
function reduce(n: bigint, d: bigint): Rational { if (d < 0n) [n, d] = [-n, -d]; const g = gcd(n, d); return { n: n / g, d: d / g }; }
function parseDecimal(value: unknown): Rational | null { if (typeof value !== "string" || !DECIMAL.test(value)) return null; const [whole, fraction = ""] = value.split("."); const d = 10n ** BigInt(fraction.length); return reduce(BigInt(whole) * d + BigInt(fraction || "0"), d); }
function parsePrice(value: unknown, exact: unknown): Rational | null { if (typeof exact === "object" && exact !== null) { const raw = exact as { n?: string | number; d?: string | number }; if (raw.n !== undefined && raw.d !== undefined) { try { const n = BigInt(raw.n); const d = BigInt(raw.d); return n > 0n && d > 0n ? reduce(n, d) : null; } catch { return null; } } } return parseDecimal(value); }
function price(value: Rational): ExactPrice { return { numerator: value.n.toString(), denominator: value.d.toString(), display: `${value.n}/${value.d}` }; }
function parseAmount(value: unknown): bigint | null { if (typeof value !== "string" || !/^\d+(?:\.\d{1,7})?$/.test(value)) return null; const [whole, fraction = ""] = value.split("."); return BigInt(whole) * AMOUNT_SCALE + BigInt(fraction.padEnd(7, "0")); }
function formatAmount(value: bigint): string { const whole = value / AMOUNT_SCALE; const fraction = (value % AMOUNT_SCALE).toString().padStart(7, "0").replace(/0+$/, ""); return fraction ? `${whole}.${fraction}` : `${whole}`; }
function requestFromInput(input: TradeAggregationViewerInput): Result<{ base: TradeAggregationAsset; counter: TradeAggregationAsset; resolution: number; startTime?: string; endTime?: string; offsetHours: number }, TradeAggregationViewerErrorCode> {
  if (input.base && input.counter) {
    const parsed = parseTradeAggregationViewerInput(JSON.stringify({ base: input.base, counter: input.counter, resolution: input.resolution ?? 3_600_000, startTime: input.startTime, endTime: input.endTime, offsetHours: input.offsetHours ?? 0 }));
    return parsed.ok ? ok({ base: parsed.value.base!, counter: parsed.value.counter!, resolution: parsed.value.resolution ?? 3_600_000, startTime: parsed.value.startTime, endTime: parsed.value.endTime, offsetHours: parsed.value.offsetHours ?? 0 }) : parsed;
  }
  if (!input.value?.trim()) return err("empty_base_asset");
  const parsed = parseTradeAggregationViewerInput(input.value);
  return parsed.ok ? ok({ base: parsed.value.base!, counter: parsed.value.counter!, resolution: parsed.value.resolution ?? 3_600_000, startTime: parsed.value.startTime, endTime: parsed.value.endTime, offsetHours: parsed.value.offsetHours ?? 0 }) : parsed;
}
function requestError(status: number): Error & { status: number } { return Object.assign(new Error("Horizon request failed."), { status }); }

/** Requests Horizon aggregations and keeps all OHLC prices as exact fractions. */
export async function runTradeAggregationViewer(input: TradeAggregationViewerInput, network: StellarNetwork, signal?: AbortSignal): Promise<Result<TradeAggregationViewerResult, TradeAggregationViewerErrorCode>> {
  const request = requestFromInput(input);
  if (!request.ok) return request;
  try {
    const query = { ...assetQuery(request.value.base, "base"), ...assetQuery(request.value.counter, "counter"), resolution: String(request.value.resolution), offset: String(request.value.offsetHours * 3_600_000), start_time: request.value.startTime ? String(Date.parse(request.value.startTime)) : undefined, end_time: request.value.endTime ? String(Date.parse(request.value.endTime)) : undefined };
    const response = await fetch(horizonUrl(network, "/trade_aggregations", query), { signal, headers: { Accept: "application/json" } });
    if (!response.ok) throw requestError(response.status);
    const payload = await response.json() as { _embedded?: { records?: unknown[] } };
    const records = payload._embedded?.records;
    if (!Array.isArray(records)) return err("request_failed");
    const buckets: TradeAggregationBucket[] = [];
    let totalBase = 0n;
    let totalCounter = 0n;
    let totalTrades = 0;
    for (const item of records) {
      if (typeof item !== "object" || item === null) return err("request_failed");
      const record = item as RawAggregation;
      const timestamp = Number(record.timestamp);
      const baseVolume = parseAmount(record.base_volume);
      const counterVolume = parseAmount(record.counter_volume);
      const tradeCount = Number(record.trade_count);
      const open = parsePrice(record.open, record.open_r);
      const high = parsePrice(record.high, record.high_r);
      const low = parsePrice(record.low, record.low_r);
      const close = parsePrice(record.close, record.close_r);
      if (!Number.isFinite(timestamp) || baseVolume === null || counterVolume === null || !Number.isSafeInteger(tradeCount) || tradeCount < 0 || !open || !high || !low || !close) return err("request_failed");
      const start = new Date(timestamp).toISOString();
      const end = new Date(timestamp + request.value.resolution).toISOString();
      buckets.push({ timestamp: start, start, end, open: price(open).display, high: price(high).display, low: price(low).display, close: price(close).display, openFraction: price(open), highFraction: price(high), lowFraction: price(low), closeFraction: price(close), baseVolume: formatAmount(baseVolume), counterVolume: formatAmount(counterVolume), tradeCount });
      totalBase += baseVolume; totalCounter += counterVolume; totalTrades += tradeCount;
    }
    buckets.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const usedStart = buckets[0]?.start ?? (request.value.startTime ? alignTime(request.value.startTime, request.value.resolution, request.value.offsetHours) : copy.notAvailable);
    const usedEnd = buckets.at(-1)?.end ?? (request.value.endTime ? alignTime(request.value.endTime, request.value.resolution, request.value.offsetHours) : copy.notAvailable);
    return ok({ base: request.value.base, counter: request.value.counter, resolution: request.value.resolution, offsetHours: request.value.offsetHours, requestedStart: request.value.startTime, requestedEnd: request.value.endTime, usedStart, usedEnd, buckets, totalBaseVolume: formatAmount(totalBase), totalCounterVolume: formatAmount(totalCounter), totalTrades, noTrades: buckets.length === 0, network });
  } catch (error) { return err(toTradeAggregationViewerErrorCode(error)); }
}

function alignTime(value: string | undefined, resolution: number, offsetHours: number): string { const timestamp = value ? Date.parse(value) : Date.now(); const offset = offsetHours * 3_600_000; return new Date(Math.floor((timestamp - offset) / resolution) * resolution + offset).toISOString(); }

export { formatAmount, parseAmount, parsePrice, price };
