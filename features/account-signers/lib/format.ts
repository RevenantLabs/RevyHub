/** Formats an integer weight as text without converting it to a Number. */
export function formatWeight(value: string): string {
  const normalized = BigInt(value).toString();
  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function signerRowKey(key: string, type: string): string {
  return `${type}:${key}`;
}
