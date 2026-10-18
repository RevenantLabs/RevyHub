import type { DisplayBalance } from "@/features/balance-viewer/types";

/**
 * Formats a Stellar amount without going through `Number`.
 *
 * Stellar amounts have 7 decimal places and can exceed the safe integer range,
 * so parsing them as floats would silently lose precision.
 */
export function formatAmount(value: string): string {
  const [whole, fraction = ""] = value.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const trimmed = fraction.replace(/0+$/, "");
  return trimmed ? `${grouped}.${trimmed}` : grouped;
}

export function formatAssetLabel(balance: DisplayBalance): string {
  if (balance.kind === "native") return "XLM (native)";
  if (balance.kind === "liquidity_pool") return "Liquidity pool shares";
  return balance.assetCode;
}

/** Case-insensitive match against asset code, issuer, or native XLM. */
export function balanceMatchesFilter(balance: DisplayBalance, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  if (balance.kind === "native") {
    return "xlm".includes(normalized) || normalized.includes("xlm") || "native".includes(normalized);
  }

  const code = balance.assetCode.toLowerCase();
  const issuer = balance.issuer?.toLowerCase() ?? "";
  return code.includes(normalized) || issuer.includes(normalized);
}

/** Returns the sum of both liability sides, or null when neither is present. */
export function totalLiabilities(balance: DisplayBalance): string | null {
  const selling = balance.sellingLiabilities;
  const buying = balance.buyingLiabilities;
  if (!selling && !buying) return null;

  const toStroops = (value = "0") => {
    const [whole, fraction = ""] = value.split(".");
    return BigInt(whole || "0") * 10_000_000n + BigInt(fraction.padEnd(7, "0").slice(0, 7));
  };

  const total = toStroops(selling) + toStroops(buying);
  const whole = total / 10_000_000n;
  const fraction = (total % 10_000_000n).toString().padStart(7, "0");
  return formatAmount(`${whole}.${fraction}`);
}
