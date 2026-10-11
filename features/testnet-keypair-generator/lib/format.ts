export function truncateAddress(address: string, visible = 8): string {
  if (address.length <= visible * 2 + 3) return address;
  return `${address.slice(0, visible)}...${address.slice(-visible)}`;
}

export function maskSeed(seed: string): string {
  if (seed.length <= 8) return "****";
  return `${seed.slice(0, 4)}${"*".repeat(seed.length - 8)}${seed.slice(-4)}`;
}
