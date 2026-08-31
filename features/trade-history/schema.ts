import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { TradeHistoryAsset, TradeHistoryErrorCode, TradeHistoryField, TradeHistoryInput } from "@/features/trade-history/types";

const ASSET_CODE = /^[A-Za-z0-9]{1,12}$/;

function readObject(raw: string): Record<string, unknown> | null {
  try { const parsed: unknown = JSON.parse(raw); return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null; } catch { return null; }
}
function parseAsset(value: unknown): TradeHistoryAsset | "empty" | null {
  if (value === undefined || value === null || value === "") return "empty";
  if (value === "native" || value === "XLM") return { type: "native" };
  if (typeof value === "string") { const [code, issuer, ...rest] = value.split(":"); return issuer && !rest.length ? parseAsset({ code, issuer }) : null; }
  if (typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  if (item.type === "native" || item.asset_type === "native") return { type: "native" };
  const code = typeof item.code === "string" ? item.code.trim() : typeof item.assetCode === "string" ? item.assetCode.trim() : "";
  const issuer = typeof item.issuer === "string" ? item.issuer.replace(/\s+/g, "") : typeof item.assetIssuer === "string" ? item.assetIssuer.replace(/\s+/g, "") : "";
  if (!code && !issuer) return "empty";
  if (!ASSET_CODE.test(code) || !issuer || issuer.startsWith("S") || !StrKey.isValidEd25519PublicKey(issuer)) return null;
  return { type: "credit", code, issuer };
}
export function assetKey(asset: TradeHistoryAsset): string { return asset.type === "native" ? "native" : `${asset.code.toUpperCase()}:${asset.issuer}`; }
export function assetQuery(asset: TradeHistoryAsset, prefix: "base" | "counter"): Record<string, string> {
  if (asset.type === "native") return { [`${prefix}_asset_type`]: "native" };
  return { [`${prefix}_asset_type`]: asset.code.length <= 4 ? "credit_alphanum4" : "credit_alphanum12", [`${prefix}_asset_code`]: asset.code, [`${prefix}_asset_issuer`]: asset.issuer };
}
export const FIELD_OF_CODE: Record<TradeHistoryErrorCode, TradeHistoryField | null> = { empty_filter: null, invalid_asset: "base", invalid_address: "account", no_trades: null, rate_limited: null, request_failed: null };

/** Validates either a pair filter, an account filter, or both. */
export function parseTradeHistoryInput(raw: string): Result<TradeHistoryInput, TradeHistoryErrorCode> {
  if (!raw.trim()) return err("empty_filter");
  const parsed = readObject(raw);
  if (!parsed) return err("empty_filter");
  const baseRaw = parsed.base ?? parsed.baseAsset;
  const counterRaw = parsed.counter ?? parsed.counterAsset;
  const hasPair = baseRaw !== undefined || counterRaw !== undefined;
  if (hasPair && (baseRaw === undefined || counterRaw === undefined)) return err("invalid_asset");
  const base = hasPair ? parseAsset(baseRaw) : undefined;
  const counter = hasPair ? parseAsset(counterRaw) : undefined;
  if (base === "empty" || counter === "empty") return err("invalid_asset");
  if (hasPair && (!base || !counter)) return err("invalid_asset");
  if (base && counter && assetKey(base) === assetKey(counter)) return err("invalid_asset");
  const account = typeof parsed.account === "string" ? parsed.account.replace(/\s+/g, "") : "";
  if (!base && !counter && !account) return err("empty_filter");
  if (account && (account.startsWith("S") || !StrKey.isValidEd25519PublicKey(account))) return err("invalid_address");
  const limit = parsed.limit === undefined ? 25 : parsed.limit;
  if (!Number.isInteger(limit) || Number(limit) < 1 || Number(limit) > 200) return err("invalid_asset");
  const cursor = parsed.cursor === undefined ? undefined : String(parsed.cursor);
  if (cursor !== undefined && cursor.length > 512) return err("invalid_asset");
  return ok({ value: raw.trim(), base: base as TradeHistoryAsset | undefined, counter: counter as TradeHistoryAsset | undefined, account: account || undefined, cursor, limit: Number(limit) });
}
export { parseAsset };
