export function formatFeePercent(feeBps: number): string {
  return `${(feeBps / 100).toFixed(2)}%`;
}
