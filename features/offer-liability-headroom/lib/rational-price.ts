const AMOUNT_SCALE = 10_000_000n;

function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y) [x, y] = [y, x % y];
  return x || 1n;
}

export function reduceRational(n: bigint, d: bigint): { n: bigint; d: bigint } {
  if (d <= 0n || n < 0n) throw new Error("invalid rational");
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

export function parseRationalPrice(raw: {
  n?: string | number;
  d?: string | number;
} | null | undefined): { n: bigint; d: bigint } | null {
  if (!raw || raw.n === undefined || raw.d === undefined) return null;
  try {
    const n = BigInt(raw.n);
    const d = BigInt(raw.d);
    if (n <= 0n || d <= 0n) return null;
    return reduceRational(n, d);
  } catch {
    return null;
  }
}

export function formatRationalDisplay(n: bigint, d: bigint): string {
  return `${n}/${d}`;
}

/** Non-authoritative decimal preview for humans; calculations keep the fraction. */
export function formatRationalApproximate(n: bigint, d: bigint): string {
  const scaled = (n * 1_000_000n) / d;
  const whole = scaled / 1_000_000n;
  const fraction = (scaled % 1_000_000n).toString().padStart(6, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : `${whole}`;
}

export function parseAmountString(value: string | undefined): bigint | null {
  if (!value || !/^\d+(?:\.\d{1,7})?$/.test(value)) return null;
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * AMOUNT_SCALE + BigInt(fraction.padEnd(7, "0"));
}

export function formatAmountString(value: bigint): string {
  const whole = value / AMOUNT_SCALE;
  const fraction = (value % AMOUNT_SCALE).toString().padStart(7, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : `${whole}`;
}

export function subtractAmounts(balance: string, liabilities: string): string | null {
  const left = parseAmountString(balance);
  const right = parseAmountString(liabilities);
  if (left === null || right === null) return null;
  if (left < right) return formatAmountString(0n);
  return formatAmountString(left - right);
}
