import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  OrderbookAsset,
  OrderbookViewerErrorCode,
  OrderbookViewerInput
} from "@/features/orderbook-viewer/types";

const ASSET_CODE = /^[A-Za-z0-9]{1,12}$/;

function readObject(raw: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function parseAsset(value: unknown): OrderbookAsset | "empty" | null {
  if (value === undefined || value === null || value === "") return "empty";
  if (value === "native" || value === "XLM") return { type: "native" };
  if (typeof value === "string") {
    const [code, issuer, ...rest] = value.split(":");
    if (!issuer || rest.length) return null;
    return parseAsset({ code, issuer });
  }
  if (typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  if (item.type === "native" || item.asset_type === "native") return { type: "native" };
  const code = typeof item.code === "string" ? item.code.trim() : typeof item.assetCode === "string" ? item.assetCode.trim() : "";
  const issuer = typeof item.issuer === "string" ? item.issuer.replace(/\s+/g, "") : typeof item.assetIssuer === "string" ? item.assetIssuer.replace(/\s+/g, "") : "";
  if (!code && !issuer) return "empty";
  if (!ASSET_CODE.test(code) || !issuer || issuer.startsWith("S") || !StrKey.isValidEd25519PublicKey(issuer)) return null;
  return { type: "credit", code, issuer };
}

export function assetKey(asset: OrderbookAsset): string {
  return asset.type === "native" ? "native" : `${asset.code.toUpperCase()}:${asset.issuer}`;
}

export function assetQuery(asset: OrderbookAsset, prefix: "selling" | "buying"): Record<string, string> {
  if (asset.type === "native") return { [`${prefix}_asset_type`]: "native" };
  return {
    [`${prefix}_asset_type`]: asset.code.length <= 4 ? "credit_alphanum4" : "credit_alphanum12",
    [`${prefix}_asset_code`]: asset.code,
    [`${prefix}_asset_issuer`]: asset.issuer
  };
}

export const FIELD_OF_CODE: Record<OrderbookViewerErrorCode, "selling" | "buying" | null> = {
  empty_selling_asset: "selling", invalid_selling_asset: "selling", empty_buying_asset: "buying", invalid_buying_asset: "buying", same_asset: null, empty_orderbook: null, rate_limited: null, request_failed: null
};

/** Parses pair filters before any Horizon request is made. */
export function parseOrderbookViewerInput(raw: string): Result<OrderbookViewerInput, OrderbookViewerErrorCode> {
  if (!raw.trim()) return err("empty_selling_asset");
  const parsed = readObject(raw);
  if (!parsed) return err("invalid_selling_asset");
  const sellingRaw = parsed.selling ?? parsed.sellingAsset;
  const buyingRaw = parsed.buying ?? parsed.buyingAsset;
  const selling = parseAsset(sellingRaw);
  if (selling === "empty") return err("empty_selling_asset");
  if (!selling) return err("invalid_selling_asset");
  const buying = parseAsset(buyingRaw);
  if (buying === "empty") return err("empty_buying_asset");
  if (!buying) return err("invalid_buying_asset");
  if (assetKey(selling) === assetKey(buying)) return err("same_asset");
  const limit = parsed.limit === undefined ? 20 : parsed.limit;
  if (!Number.isInteger(limit) || Number(limit) < 1 || Number(limit) > 200) return err("invalid_selling_asset");
  return ok({ value: raw.trim(), selling, buying, limit: Number(limit) });
}

export { parseAsset };
