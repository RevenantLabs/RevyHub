/** Presentation-only helpers. Keep formatting out of components and logic. */
export function shortenHex(value: string, visible = 8): string {
  if (value.length <= visible * 2 + 3) return value;
  return `${value.slice(0, visible)}...${value.slice(-visible)}`;
}

export function formatArgCount(count: number): string {
  if (count === 0) return "No constructor arguments";
  return count === 1 ? "1 constructor argument" : `${count} constructor arguments`;
}
