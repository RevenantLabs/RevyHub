import { Horizon } from "@stellar/stellar-sdk";

export type StellarNetwork = "testnet" | "mainnet";

export const STELLAR_NETWORK: StellarNetwork =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet" ? "mainnet" : "testnet";

export const horizonUrls = {
  testnet:
    process.env.NEXT_PUBLIC_HORIZON_TESTNET_URL ?? "https://horizon-testnet.stellar.org",
  mainnet: process.env.NEXT_PUBLIC_HORIZON_MAINNET_URL ?? "https://horizon.stellar.org"
};

export const horizonServer = new Horizon.Server(horizonUrls[STELLAR_NETWORK]);

export function getHorizonServer(network: StellarNetwork = STELLAR_NETWORK) {
  return new Horizon.Server(horizonUrls[network]);
}

const DEFAULT_BASE_RESERVE_XLM = 0.5;

/** Fetch the network base reserve (in XLM) from the latest ledger, falling back to 0.5 XLM. */
export async function getBaseReserve(network: StellarNetwork = STELLAR_NETWORK): Promise<number> {
  try {
    const server = getHorizonServer(network);
    const ledgerResponse = await server.ledgers().limit(1).order("desc").call();
    const latestLedger = ledgerResponse.records[0];

    if (latestLedger?.base_reserve_in_stroops) {
      return Number(latestLedger.base_reserve_in_stroops) / 10_000_000;
    }
  } catch {
    // Network unavailable — use safe default.
  }

  return DEFAULT_BASE_RESERVE_XLM;
}
