export function formatNetworkType(type: string): string {
  const labels: Record<string, string> = {
    mainnet: "Mainnet",
    testnet: "Testnet",
    futurenet: "Futurenet",
    custom: "Custom",
  };
  return labels[type] ?? type;
}

export function truncateUrl(url: string, maxLen: number = 40): string {
  if (url.length <= maxLen) return url;
  return url.slice(0, maxLen - 3) + "...";
}
