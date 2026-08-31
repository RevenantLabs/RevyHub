import { truncateMiddle } from "@/core/lib/strings";
import { copy } from "@/features/effects-timeline/copy";

const AMOUNT = /^-?\d+(\.\d{1,7})?$/;
const STROOPS_PER_UNIT = 10_000_000n;

/**
 * Converts a Stellar amount to stroops without ever touching a float.
 *
 * Amounts have exactly seven decimal places and reach the int64 ceiling, which
 * `Number` cannot represent, so the fraction is padded and concatenated as
 * digits rather than multiplied.
 */
export function toStroops(amount: string): bigint {
  const negative = amount.startsWith("-");
  const [whole, fraction = ""] = (negative ? amount.slice(1) : amount).split(".");
  const value =
    BigInt(whole || "0") * STROOPS_PER_UNIT + BigInt(`${fraction}0000000`.slice(0, 7));
  return negative ? -value : value;
}

/**
 * Renders an amount with thousands separators and no trailing zeros.
 *
 * Anything that is not a Stellar amount is passed through untouched: a bad
 * value from Horizon is worth showing verbatim, not silently rounded.
 */
export function formatAmount(value: string): string {
  if (!AMOUNT.test(value)) return value;

  const stroops = toStroops(value);
  const magnitude = stroops < 0n ? -stroops : stroops;
  const whole = (magnitude / STROOPS_PER_UNIT)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const fraction = (magnitude % STROOPS_PER_UNIT)
    .toString()
    .padStart(7, "0")
    .replace(/0+$/, "");
  const sign = stroops < 0n ? "-" : "";

  return fraction ? `${sign}${whole}.${fraction}` : `${sign}${whole}`;
}

/** Renders the asset of an effect from Horizon's split `asset_*` fields. */
export function formatAsset(
  assetType?: string,
  assetCode?: string,
  assetIssuer?: string
): string {
  if (assetType === "native") return copy.nativeAsset;
  if (!assetCode) return copy.unknownAsset;
  return assetIssuer ? `${assetCode} · ${truncateMiddle(assetIssuer, 4)}` : assetCode;
}

/** Renders the canonical `CODE:ISSUER` form used by claimable balances. */
export function formatCanonicalAsset(asset?: string): string {
  if (!asset) return copy.unknownAsset;
  if (asset === "native") return copy.nativeAsset;

  const [code, issuer] = asset.split(":");
  return formatAsset(undefined, code, issuer);
}

export function formatAmountWithAsset(amount: string, asset: string): string {
  return `${formatAmount(amount)} ${asset}`;
}

/** Snake-cased Horizon effect types read as sentences, with a few overrides. */
export function formatEffectType(type: string): string {
  const override = copy.effectTypeLabels[type];
  if (override) return override;

  const words = type.replace(/_/g, " ").trim();
  return words ? words[0].toUpperCase() + words.slice(1) : type;
}

/** Middle-truncates addresses, pool ids and claimable balance ids. */
export function formatIdentifier(value: string): string {
  return truncateMiddle(value, 6);
}

/** ISO-8601 from Horizon, rendered as a stable UTC string. */
export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.toISOString().slice(0, 19).replace("T", " ")} UTC`;
}
