const STROOPS_PER_XLM = 10_000_000n;

/** Converts a stroop integer into an exact seven-decimal Stellar amount. */
export function stroopsToAmount(stroops: bigint): string {
  const negative = stroops < 0n;
  const absolute = negative ? -stroops : stroops;
  const whole = absolute / STROOPS_PER_XLM;
  const fraction = (absolute % STROOPS_PER_XLM).toString().padStart(7, "0");
  return `${negative ? "-" : ""}${whole}.${fraction}`;
}

/** Parses a Horizon-style amount using fixed seven-decimal stroop arithmetic. */
export function amountToStroops(value: string): bigint {
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * STROOPS_PER_XLM + BigInt(fraction.padEnd(7, "0"));
}

/** Groups stroops for display without converting through Number. */
export function formatStroops(value: string): string {
  const negative = value.startsWith("-");
  const digits = negative ? value.slice(1) : value;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${negative ? "−" : ""}${grouped} stroops`;
}

/** Formats an amount for display without converting it to a Number. */
export function formatAmount(value: string): string {
  const negative = value.startsWith("-");
  const unsigned = negative ? value.slice(1) : value;
  const [whole, fraction = ""] = unsigned.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const trimmed = fraction.replace(/0+$/, "");
  return `${negative ? "−" : ""}${grouped}${trimmed ? `.${trimmed}` : ""}`;
}
