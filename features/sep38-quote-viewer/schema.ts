import { err, ok, type Result } from "@/core/result/result";
import {
  assignSellAndBuy,
  containsSecretKey,
  normalizeOffChainAsset,
  normalizeOnChainAsset,
  positiveDecimal
} from "@/features/sep38-quote-viewer/lib/asset-pair-fields";
import type {
  Sep38QuoteViewerErrorCode,
  Sep38QuoteViewerField,
  Sep38QuoteViewerInput,
  Sep38QuoteViewerRawInput,
  Sep38SellSide
} from "@/features/sep38-quote-viewer/types";

const HOSTNAME =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

/**
 * Accept a home domain or a bare https origin. Paths, ports, and credentials
 * are rejected so the toml URL is always the well-known path on that host.
 */
export function parseHomeDomain(raw: string): Result<string, "invalid_home_domain"> {
  const value = raw.trim();
  if (!value || containsSecretKey(value)) return err("invalid_home_domain");
  if (/^http:\/\//i.test(value) || value.includes("@")) return err("invalid_home_domain");

  let hostname = value;
  if (/^https:\/\//i.test(value)) {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      return err("invalid_home_domain");
    }
    if (url.protocol !== "https:" || url.username || url.password || url.port || url.search || url.hash) {
      return err("invalid_home_domain");
    }
    if (url.pathname !== "/" && url.pathname !== "") return err("invalid_home_domain");
    hostname = url.hostname;
  } else if (/[/:?#\s]/.test(value)) {
    return err("invalid_home_domain");
  }

  hostname = hostname.toLowerCase().replace(/\.$/, "");
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
    return err("invalid_home_domain");
  }
  if (!HOSTNAME.test(hostname)) return err("invalid_home_domain");
  return ok(hostname);
}

function parseSellSide(raw: string): Result<Sep38SellSide, "invalid_asset"> {
  const value = raw.trim();
  if (value === "off-chain" || value === "on-chain") return ok(value);
  return err("invalid_asset");
}

/** Validate the domain, both assets, and the amount before any network call. */
export function parseSep38QuoteViewerInput(
  raw: Sep38QuoteViewerRawInput
): Result<Sep38QuoteViewerInput, Sep38QuoteViewerErrorCode, Sep38QuoteViewerField> {
  const homeDomain = parseHomeDomain(raw.homeDomain);
  if (!homeDomain.ok) return err("invalid_home_domain", "home_domain");

  const offChain = normalizeOffChainAsset(raw.offChainAsset);
  if (!offChain.ok) return err("invalid_asset", "off_chain");

  const onChain = normalizeOnChainAsset(raw.onChainAsset);
  if (!onChain.ok) return err("invalid_asset", "on_chain");

  const sellSide = parseSellSide(raw.sellSide);
  if (!sellSide.ok) return err("invalid_asset", "sell_side");

  const amount = positiveDecimal(raw.sellAmount);
  if (!amount) return err("invalid_amount", "amount");

  const pair = assignSellAndBuy(offChain.value, onChain.value, sellSide.value);
  return ok({
    homeDomain: homeDomain.value,
    offChain: offChain.value,
    onChain: onChain.value,
    sellSide: sellSide.value,
    sellAmount: amount.text,
    sellAsset: pair.sellAsset,
    buyAsset: pair.buyAsset
  });
}
