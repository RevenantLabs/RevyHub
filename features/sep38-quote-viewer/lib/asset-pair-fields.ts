import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { OffChainAsset, OnChainAsset } from "@/features/sep38-quote-viewer/types";

const ASSET_CODE = /^[A-Za-z0-9]{1,12}$/;
const ISO_ASSET = /^iso4217:([A-Z]{3})$/;
const SECRET_KEY = /(?:^|[^A-Z2-7])S[A-Z2-7]{13,}(?![A-Z2-7])/;

/**
 * A Stellar secret seed starts with S. Reject that prefix before any checksum
 * so a seed is never parsed, stored, or echoed.
 */
export function containsSecretKey(value: string): boolean {
  return SECRET_KEY.test(value.trim());
}

export function scrubSecret(value: string): string {
  return containsSecretKey(value) ? "" : value;
}

/**
 * Parse a positive decimal without floating point.
 * `scaled` is the integer formed by the digits, so callers can compare with BigInt.
 */
export function positiveDecimal(value: string): { text: string; scaled: bigint } | null {
  const text = value.trim();
  const match = /^(0|[1-9]\d*)(?:\.(\d{1,18}))?$/.exec(text);
  if (!match) return null;

  const whole = match[1];
  const fraction = match[2] ?? "";
  const scale = 10n ** BigInt(fraction.length);
  const scaled = BigInt(whole) * scale + BigInt(fraction === "" ? "0" : fraction);
  if (scaled <= 0n) return null;
  return { text, scaled };
}

export function normalizeOffChainAsset(raw: string): Result<OffChainAsset, "invalid_asset"> {
  const value = raw.trim();
  if (!value || containsSecretKey(value)) return err("invalid_asset");
  const match = ISO_ASSET.exec(value);
  if (!match) return err("invalid_asset");

  const code = match[1];
  return ok({
    kind: "off-chain",
    scheme: "iso4217",
    code,
    canonical: `iso4217:${code}`
  });
}

export function normalizeOnChainAsset(raw: string): Result<OnChainAsset, "invalid_asset"> {
  const value = raw.trim();
  if (!value || containsSecretKey(value)) return err("invalid_asset");

  if (value === "native" || value === "stellar:native") {
    return ok({
      kind: "on-chain",
      scheme: "stellar",
      code: "XLM",
      native: true,
      canonical: "stellar:native"
    });
  }

  const match = /^stellar:([A-Za-z0-9]{1,12}):(G[A-Z2-7]{55})$/.exec(value);
  if (!match) return err("invalid_asset");

  const code = match[1];
  const issuer = match[2];
  if (!ASSET_CODE.test(code) || code.toUpperCase() === "XLM") return err("invalid_asset");
  if (!issuer.startsWith("G") || !StrKey.isValidEd25519PublicKey(issuer)) return err("invalid_asset");

  return ok({
    kind: "on-chain",
    scheme: "stellar",
    code,
    issuer,
    native: false,
    canonical: `stellar:${code}:${issuer}`
  });
}

export function assignSellAndBuy(
  offChain: OffChainAsset,
  onChain: OnChainAsset,
  sellSide: "off-chain" | "on-chain"
): { sellAsset: string; buyAsset: string } {
  if (sellSide === "off-chain") {
    return { sellAsset: offChain.canonical, buyAsset: onChain.canonical };
  }
  return { sellAsset: onChain.canonical, buyAsset: offChain.canonical };
}
