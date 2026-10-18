import { Horizon } from "@stellar/stellar-sdk";
import { DEFAULT_NETWORK, HORIZON_URLS } from "@/core/network/config";
import type { StellarNetwork } from "@/core/network/types";

const cache = new Map<StellarNetwork, Horizon.Server>();

/** Returns a memoised Horizon server for the given network. */
export function horizonServer(network: StellarNetwork = DEFAULT_NETWORK): Horizon.Server {
  const existing = cache.get(network);
  if (existing) return existing;

  const server = new Horizon.Server(HORIZON_URLS[network]);
  cache.set(network, server);
  return server;
}

/** Builds a Horizon REST URL for features that need raw fetch access. */
export function horizonUrl(
  network: StellarNetwork,
  pathname: string,
  query: Record<string, string | number | undefined> = {}
): string {
  const url = new URL(pathname.replace(/^\//, ""), `${HORIZON_URLS[network]}/`);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

/** Test seam: clears memoised servers between test cases. */
export function resetHorizonClients(): void {
  cache.clear();
}
