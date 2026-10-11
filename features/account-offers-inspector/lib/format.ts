export function formatPrice(n: number, d: number): string {
  if (d === 0) return "0";
  return (n / d).toFixed(7);
}

export function formatAssetDisplay(asset: string): string {
  if (asset === "XLM") return "XLM";
  const [code, issuer] = asset.split(":");
  if (!issuer) return code;
  return `${code} (${issuer.slice(0, 4)}...${issuer.slice(-4)})`;
}

export function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "Invalid Date";
  }
}
