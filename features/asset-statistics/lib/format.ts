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
