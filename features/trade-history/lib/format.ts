export function formatSummary(value: string): string { return value.trim(); }
export function formatAsset(asset: { type: "native" } | { type: "credit"; code: string; issuer: string }): string { return asset.type === "native" ? "XLM" : `${asset.code}:${asset.issuer.slice(0, 6)}...`; }
export function formatCursorState(hasPrevious: boolean, hasNext: boolean): string { return hasPrevious && hasNext ? "middle" : hasPrevious ? "last" : hasNext ? "first" : "only"; }
