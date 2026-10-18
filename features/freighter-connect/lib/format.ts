import type { StellarNetwork } from "@/core/network/types";
import type { WalletNetwork, WalletSnapshot } from "@/features/freighter-connect/types";

export function formatWalletNetwork(network: WalletNetwork, raw?: string): string {
  if (network === "unknown") return raw ? `Unrecognised (${raw})` : "Unknown";
  return network === "testnet" ? "Testnet" : "Mainnet";
}

/**
 * A mismatch only counts when both sides are known. An unrecognised wallet
 * network is reported as unrecognised, not silently treated as a mismatch.
 */
export function hasNetworkMismatch(
  snapshot: WalletSnapshot,
  appNetwork: StellarNetwork
): boolean {
  if (!snapshot.allowed || snapshot.network === "unknown") return false;
  return snapshot.network !== appNetwork;
}
