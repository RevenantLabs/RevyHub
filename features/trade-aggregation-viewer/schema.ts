import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { TradeAggregationAsset, TradeAggregationViewerErrorCode, TradeAggregationViewerField, TradeAggregationViewerInput } from "@/features/trade-aggregation-viewer/types";

const ASSET_CODE = /^[A-Za-z0-9]{1,12}$/;
export const RESOLUTIONS = [60_000, 300_000, 900_000, 3_600_000, 86_400_000, 604_800_000, 2_592_000_000] as const;

function readObject(raw: string): Record<string, unknown> | null {
  try { const parsed: unknown = JSON.parse(raw); return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null; } catch { return null; }
}

function parseAsset(value: unknown): TradeAggregationAsset | "empty" | null {
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

export function assetKey(asset: TradeAggregationAsset): string { return asset.type === "native" ? "native" : `${asset.code.toUpperCase()}:${asset.issuer}`; }
export function assetQuery(asset: TradeAggregationAsset, prefix: "base" | "counter"): Record<string, string> {
  if (asset.type === "native") return { [`${prefix}_asset_type`]: "native" };
  return { [`${prefix}_asset_type`]: asset.code.length <= 4 ? "credit_alphanum4" : "credit_alphanum12", [`${prefix}_asset_code`]: asset.code, [`${prefix}_asset_issuer`]: asset.issuer };
}

export const FIELD_OF_CODE: Record<TradeAggregationViewerErrorCode, TradeAggregationViewerField | null> = {
  empty_base_asset: "base", invalid_base_asset: "base", empty_counter_asset: "counter", invalid_counter_asset: "counter", same_asset: null, invalid_resolution: "resolution", invalid_offset: "offset", no_trades: null, rate_limited: null, request_failed: null
};

/** Validates pair, resolution, offset and optional time bounds locally. */
export function parseTradeAggregationViewerInput(raw: string): Result<TradeAggregationViewerInput, TradeAggregationViewerErrorCode> {
  if (!raw.trim()) return err("empty_base_asset");
  const parsed = readObject(raw);
  if (!parsed) return err("invalid_base_asset");
  const base = parseAsset(parsed.base ?? parsed.baseAsset);
  if (base === "empty") return err("empty_base_asset");
  if (!base) return err("invalid_base_asset");
  const counter = parseAsset(parsed.counter ?? parsed.counterAsset);
  if (counter === "empty") return err("empty_counter_asset");
  if (!counter) return err("invalid_counter_asset");
  if (assetKey(base) === assetKey(counter)) return err("same_asset");
  const resolution = parsed.resolution === undefined ? 3_600_000 : parsed.resolution;
  if (!Number.isInteger(resolution) || !RESOLUTIONS.includes(resolution as typeof RESOLUTIONS[number])) return err("invalid_resolution");
  const offsetHours = parsed.offsetHours === undefined ? 0 : parsed.offsetHours;
  if (!Number.isInteger(offsetHours) || Number(offsetHours) < 0 || (Number(resolution) < 3_600_000 && Number(offsetHours) !== 0) || Number(offsetHours) * 3_600_000 >= Number(resolution)) return err("invalid_offset");
  const startTime = parsed.startTime === undefined ? undefined : String(parsed.startTime);
  const endTime = parsed.endTime === undefined ? undefined : String(parsed.endTime);
  if ((startTime !== undefined && !Number.isFinite(Date.parse(startTime))) || (endTime !== undefined && !Number.isFinite(Date.parse(endTime)))) return err("invalid_resolution");
  if (startTime && endTime && Date.parse(startTime) >= Date.parse(endTime)) return err("invalid_resolution");
  return ok({ value: raw.trim(), base, counter, resolution: Number(resolution), startTime, endTime, offsetHours: Number(offsetHours) });
}

export { parseAsset };
