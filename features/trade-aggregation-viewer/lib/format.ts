export function formatSummary(value: string): string { return value.trim(); }
export function formatAsset(asset: { type: "native" } | { type: "credit"; code: string; issuer: string }): string { return asset.type === "native" ? "XLM" : `${asset.code}:${asset.issuer.slice(0, 6)}...`; }
export function formatResolution(resolution: number): string { const minutes = resolution / 60_000; return minutes >= 60 ? `${minutes / 60}h` : `${minutes}m`; }
