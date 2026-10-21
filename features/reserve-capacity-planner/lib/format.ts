/** One XLM is 10,000,000 stroops. Shared by parsing and display. */
export const STROOPS_PER_XLM = 10_000_000n;

/** Fixed 7-decimal XLM string. Callers only pass non-negative stroop totals. */
export function stroopsToXlm(stroops: bigint): string {
  const whole = stroops / STROOPS_PER_XLM;
  const fraction = (stroops % STROOPS_PER_XLM).toString().padStart(7, "0");
  return `${whole.toString()}.${fraction}`;
}

/** Groups whole XLM and trims trailing zeros. Does not use Number. */
export function formatXlm(xlm: string): string {
  const [whole, fraction = ""] = xlm.split(".");
  const grouped = groupDigits(whole);
  const trimmed = fraction.replace(/0+$/, "");
  return `${grouped}${trimmed ? `.${trimmed}` : ""} XLM`;
}

/** Groups a stroop integer string for display. */
export function formatStroops(stroops: string): string {
  return `${groupDigits(stroops)} stroops`;
}

/** Groups a non-negative integer count. */
export function formatCount(count: string): string {
  return groupDigits(count);
}

function groupDigits(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
