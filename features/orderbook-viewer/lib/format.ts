export function formatSummary(value: string): string { return value.trim(); }

export function formatPercentBasisPoints(value: bigint): string {
  const sign = value < 0n ? "-" : "";
  const absolute = value < 0n ? -value : value;
  return `${sign}${absolute / 100n}.${(absolute % 100n).toString().padStart(2, "0")}%`;
}

export function formatAsset(asset: { type: "native" } | { type: "credit"; code: string; issuer: string }): string {
  return asset.type === "native" ? "XLM" : `${asset.code}:${asset.issuer.slice(0, 6)}...`;
}
