/** Missing remaining quota is unknown, never zero. */
export function isLowQuota(remaining: string | null, threshold: number): boolean {
  return remaining !== null && /^\d+$/.test(remaining) && BigInt(remaining) < BigInt(threshold);
}
