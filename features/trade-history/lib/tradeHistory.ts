import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { toTradeHistoryErrorCode } from "@/features/trade-history/lib/tradeHistory.errors";
import { assetQuery, parseTradeHistoryInput } from "@/features/trade-history/schema";
import type { ExactTradePrice, TradeHistoryAsset, TradeHistoryErrorCode, TradeHistoryInput, TradeHistoryRecord, TradeHistoryResult, TradeHistorySide } from "@/features/trade-history/types";

interface Rational { n: bigint; d: bigint; }
interface RawTrade extends Record<string, unknown> {
  id?: string | number; paging_token?: string; ledger_close_time?: string; base_account?: string; base_amount?: string; base_asset_type?: string; base_asset_code?: string; base_asset_issuer?: string; counter_account?: string; counter_amount?: string; counter_asset_type?: string; counter_asset_code?: string; counter_asset_issuer?: string; base_is_seller?: boolean; price?: { n?: string | number; d?: string | number } | string; price_r?: { n?: string | number; d?: string | number }; offer_id?: string | number; base_offer_id?: string | number; counter_offer_id?: string | number; trade_type?: string; liquidity_pool_id?: string; transaction_hash?: string; }
function gcd(a: bigint, b: bigint): bigint { let x = a < 0n ? -a : a; let y = b < 0n ? -b : b; while (y) [x, y] = [y, x % y]; return x || 1n; }
function reduce(n: bigint, d: bigint): Rational { const g = gcd(n, d); return { n: n / g, d: d / g }; }
function parseDecimal(value: string): Rational | null { if (!/^\d+(?:\.\d+)?$/.test(value)) return null; const [whole, fraction = ""] = value.split("."); const d = 10n ** BigInt(fraction.length); return reduce(BigInt(whole) * d + BigInt(fraction || "0"), d); }
function parsePrice(raw: RawTrade): Rational | null { const exact = raw.price_r ?? (typeof raw.price === "object" && raw.price !== null ? raw.price : undefined); if (exact && typeof exact === "object" && "n" in exact && "d" in exact && exact.n !== undefined && exact.d !== undefined) { try { const n = BigInt(exact.n); const d = BigInt(exact.d); return n > 0n && d > 0n ? reduce(n, d) : null; } catch { return null; } } return typeof raw.price === "string" ? parseDecimal(raw.price) : null; }
function price(value: Rational): ExactTradePrice { return { numerator: value.n.toString(), denominator: value.d.toString(), display: `${value.n}/${value.d}` }; }
function parseAsset(type: unknown, code: unknown, issuer: unknown): TradeHistoryAsset | null { if (type === "native") return { type: "native" }; if (typeof code !== "string" || typeof issuer !== "string" || !code || !issuer) return null; return { type: "credit", code, issuer }; }
function requestError(status: number): Error & { status: number } { return Object.assign(new Error("Horizon request failed."), { status }); }
function cursorFromHref(href: unknown): string | undefined { if (typeof href !== "string" || !href) return undefined; try { return new URL(href).searchParams.get("cursor") ?? undefined; } catch { return undefined; } }
function normaliseTrade(raw: RawTrade, index: number): TradeHistoryRecord | null {
  const base = parseAsset(raw.base_asset_type, raw.base_asset_code, raw.base_asset_issuer);
  const counter = parseAsset(raw.counter_asset_type, raw.counter_asset_code, raw.counter_asset_issuer);
  const exact = parsePrice(raw);
  const timestamp = typeof raw.ledger_close_time === "string" && Number.isFinite(Date.parse(raw.ledger_close_time)) ? new Date(raw.ledger_close_time).toISOString() : null;
  const poolId = typeof raw.liquidity_pool_id === "string" ? raw.liquidity_pool_id : undefined;
  if (!base || !counter || !exact || !timestamp || typeof raw.base_amount !== "string" || typeof raw.counter_amount !== "string") return null;
  const baseAccount = typeof raw.base_account === "string" ? raw.base_account : "";
  const counterAccount = typeof raw.counter_account === "string" ? raw.counter_account : "";
  const kind: TradeHistoryRecord["kind"] = raw.trade_type === "liquidity_pool" || poolId !== undefined || (raw.offer_id === undefined && raw.base_offer_id === undefined && raw.counter_offer_id === undefined) ? "liquidity_pool" : "orderbook";
  const id = String(raw.id ?? raw.paging_token ?? `trade-${index + 1}`);
  const baseIsSeller = raw.base_is_seller === true;
  const baseSide: TradeHistorySide = { account: baseAccount, asset: base, amount: raw.base_amount };
  const counterSide: TradeHistorySide = { account: counterAccount, asset: counter, amount: raw.counter_amount };
  const offer = raw.offer_id ?? raw.base_offer_id ?? raw.counter_offer_id;
  return { id, pagingToken: typeof raw.paging_token === "string" ? raw.paging_token : id, ledgerCloseTime: timestamp, base: baseSide, counter: counterSide, baseIsSeller, executionPrice: price(exact), price: price(exact).display, priceDecimal: typeof raw.price === "string" ? raw.price : undefined, kind, liquidityPoolId: poolId, offerId: offer === undefined ? undefined : String(offer), timestamp, side: baseIsSeller ? "sell" : "buy", baseAsset: base.type === "native" ? "XLM" : base.code, quoteAsset: counter.type === "native" ? "XLM" : counter.code, amount: raw.base_amount, fee: typeof raw.fee === "string" ? raw.fee : undefined, transactionHash: typeof raw.transaction_hash === "string" ? raw.transaction_hash : undefined };
}
function requestFromInput(input: TradeHistoryInput): Result<{ base?: TradeHistoryAsset; counter?: TradeHistoryAsset; account?: string; cursor?: string; limit: number }, TradeHistoryErrorCode> {
  if (input.base || input.counter || input.account) {
    const parsed = parseTradeHistoryInput(JSON.stringify({ base: input.base, counter: input.counter, account: input.account, cursor: input.cursor, limit: input.limit ?? 25 }));
    return parsed.ok ? ok({ base: parsed.value.base, counter: parsed.value.counter, account: parsed.value.account, cursor: parsed.value.cursor, limit: parsed.value.limit ?? 25 }) : parsed;
  }
  if (!input.value?.trim()) return err("empty_filter");
  const parsed = parseTradeHistoryInput(input.value);
  return parsed.ok ? ok({ base: parsed.value.base, counter: parsed.value.counter, account: parsed.value.account, cursor: parsed.value.cursor, limit: parsed.value.limit ?? 25 }) : parsed;
}

/** Fetches one cursor page from Horizon's executed trade collection. */
export async function runTradeHistory(input: TradeHistoryInput, network: StellarNetwork, signal?: AbortSignal): Promise<Result<TradeHistoryResult, TradeHistoryErrorCode>> {
  const request = requestFromInput(input);
  if (!request.ok) return request;
  try {
    const query: Record<string, string | number | undefined> = { ...request.value.base ? assetQuery(request.value.base, "base") : {}, ...request.value.counter ? assetQuery(request.value.counter, "counter") : {}, account: request.value.account, cursor: request.value.cursor, limit: request.value.limit, order: "desc" };
    const response = await fetch(horizonUrl(network, "/trades", query), { signal, headers: { Accept: "application/json" } });
    if (!response.ok) throw requestError(response.status);
    const payload = await response.json() as { _embedded?: { records?: unknown[] }; _links?: { next?: { href?: string }; prev?: { href?: string } } };
    const rawRecords = payload._embedded?.records;
    if (!Array.isArray(rawRecords)) return err("request_failed");
    const records = rawRecords.map((record, index) => normaliseTrade(record as RawTrade, index));
    if (records.some((record) => record === null)) return err("request_failed");
    const normalized = records as TradeHistoryRecord[];
    const nextCursor = cursorFromHref(payload._links?.next?.href);
    const previousCursor = cursorFromHref(payload._links?.prev?.href);
    const filterMode = request.value.base && request.value.counter && request.value.account ? "pair+account" : request.value.base && request.value.counter ? "pair" : "account";
    return ok({ records: normalized, total: normalized.length, page: request.value.cursor ? 2 : 1, pageSize: request.value.limit, limit: request.value.limit, filterMode, base: request.value.base, counter: request.value.counter, account: request.value.account, cursor: request.value.cursor, nextCursor, previousCursor, hasNext: nextCursor !== undefined, hasPrevious: previousCursor !== undefined, noTrades: normalized.length === 0, network });
  } catch (error) { return err(toTradeHistoryErrorCode(error)); }
}

export async function loadTradeHistoryPage(result: TradeHistoryResult, network: StellarNetwork, direction: "next" | "previous", signal?: AbortSignal): Promise<Result<TradeHistoryResult, TradeHistoryErrorCode>> {
  const cursor = direction === "next" ? result.nextCursor : result.previousCursor;
  if (!cursor) return ok(result);
  const next = await runTradeHistory({ base: result.base, counter: result.counter, account: result.account, cursor, limit: result.limit }, network, signal);
  return next.ok ? ok({ ...next.value, page: direction === "next" ? result.page + 1 : Math.max(1, result.page - 1) }) : next;
}

export { normaliseTrade, parsePrice, price };
