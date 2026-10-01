const STROOPS_PER_XLM = 10_000_000n;

/** Parses a fixed seven-decimal Stellar amount into integer stroops. */
export function amountToStroops(value: string): bigint {
  if (!/^\d+(?:\.\d{1,7})?$/.test(value)) throw new Error("Invalid Horizon amount");
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * STROOPS_PER_XLM + BigInt(fraction.padEnd(7, "0"));
}

/** Formats integer stroops as an exact amount string without converting to Number. */
export function stroopsToAmount(stroops: bigint | string): string {
  const value = typeof stroops === "bigint" ? stroops : BigInt(stroops);
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const whole = absolute / STROOPS_PER_XLM;
  const fraction = (absolute % STROOPS_PER_XLM)
    .toString()
    .padStart(7, "0")
    .replace(/0+$/, "");
  return `${negative ? "-" : ""}${whole}${fraction ? `.${fraction}` : ""}`;
}

/** Formats an amount string with thousands grouping and the XLM unit. */
export function formatAmount(stroops: string): string {
  const negative = stroops.startsWith("-");
  const unsigned = negative ? stroops.slice(1) : stroops;
  const [whole, fraction = ""] = unsigned.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const trimmed = fraction.replace(/0+$/, "");
  return `${negative ? "−" : ""}${grouped}${trimmed ? `.${trimmed}` : ""} XLM`;
}

/** Converts integer stroops straight to a grouped, unit-suffixed XLM display. */
export function formatStroops(stroops: string): string {
  return formatAmount(stroopsToAmount(stroops));
}

/** Reserve cost in stroops for a number of units at the current base reserve. */
export function reserveCostStroops(units: number, baseReserveStroops: string): string {
  return (BigInt(units) * BigInt(baseReserveStroops)).toString();
}

/** Human label for a reserve-unit count. */
export function reserveUnitsLabel(units: number): string {
  return units === 1 ? "1 reserve unit" : `${units} reserve units`;
}
