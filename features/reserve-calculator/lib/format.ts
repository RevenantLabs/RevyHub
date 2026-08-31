const STROOPS_PER_XLM = 10_000_000n;

/** Converts a stroop integer into an exact seven-decimal Stellar amount. */
export function stroopsToAmount(stroops: bigint): string {
  const negative = stroops < 0n;
  const absolute = negative ? -stroops : stroops;
  const whole = absolute / STROOPS_PER_XLM;
  const fraction = (absolute % STROOPS_PER_XLM).toString().padStart(7, "0");
  return `${negative ? "-" : ""}${whole}.${fraction}`;
}

/** Formats an amount for display without converting it to a Number. */
export function formatAmount(value: string): string {
  const negative = value.startsWith("-");
  const unsigned = negative ? value.slice(1) : value;
  const [whole, fraction = ""] = unsigned.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const trimmed = fraction.replace(/0+$/, "");
  return `${negative ? "−" : ""}${grouped}${trimmed ? `.${trimmed}` : ""} XLM`;
}

export function formatLedger(sequence: number): string {
  return sequence.toLocaleString("en-US");
}
