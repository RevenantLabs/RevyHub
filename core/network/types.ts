export type StellarNetwork = "testnet" | "mainnet";

export const STELLAR_NETWORKS: readonly StellarNetwork[] = ["testnet", "mainnet"] as const;

export function isStellarNetwork(value: unknown): value is StellarNetwork {
  return value === "testnet" || value === "mainnet";
}
