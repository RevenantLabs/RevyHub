const AMOUNT = /^(\d+)(?:\.(\d{1,7}))?$/;
const STROOPS_PER_UNIT = 10_000_000n;

/** Parses a non-negative Stellar amount without passing through Number. */
export function amountToStroops(value: string): bigint | null {
  const match = AMOUNT.exec(value);
  if (!match) return null;

  return BigInt(match[1]) * STROOPS_PER_UNIT + BigInt((match[2] ?? "").padEnd(7, "0"));
}

export function stroopsToAmount(value: bigint): string {
  const whole = value / STROOPS_PER_UNIT;
  const fraction = (value % STROOPS_PER_UNIT).toString().padStart(7, "0");
  return `${whole}.${fraction}`;
}

export function normalizeAmount(value: string): string | null {
  const stroops = amountToStroops(value);
  return stroops === null ? null : stroopsToAmount(stroops);
}

export function sumAmounts(values: string[]): string | null {
  let total = 0n;
  for (const value of values) {
    const stroops = amountToStroops(value);
    if (stroops === null) return null;
    total += stroops;
  }
  return stroopsToAmount(total);
}

/** Groups the whole part while deliberately preserving all seven decimals. */
export function formatAmount(value: string): string {
  const [whole, fraction = "0000000"] = value.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${grouped}.${fraction.padEnd(7, "0")}`;
}

export function formatInteger(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
