import { Horizon, Networks } from "@stellar/stellar-sdk";

export type StellarNetwork = "testnet" | "mainnet";

export const STELLAR_NETWORK: StellarNetwork =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet" ? "mainnet" : "testnet";

export const horizonUrls = {
  testnet:
    process.env.NEXT_PUBLIC_HORIZON_TESTNET_URL ?? "https://horizon-testnet.stellar.org",
  mainnet: process.env.NEXT_PUBLIC_HORIZON_MAINNET_URL ?? "https://horizon.stellar.org"
};

export const networkPassphrases: Record<StellarNetwork, string> = {
  testnet: Networks.TESTNET,
  mainnet: Networks.PUBLIC
};

export const horizonServer = new Horizon.Server(horizonUrls[STELLAR_NETWORK]);

export function getHorizonServer(network: StellarNetwork = STELLAR_NETWORK) {
  return new Horizon.Server(horizonUrls[network]);
}
