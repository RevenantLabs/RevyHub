import type { StellarNetwork } from "@/core/network/types";
import { isStellarNetwork } from "@/core/network/types";

export const DEFAULT_NETWORK: StellarNetwork = isStellarNetwork(
  process.env.NEXT_PUBLIC_STELLAR_NETWORK
)
  ? process.env.NEXT_PUBLIC_STELLAR_NETWORK
  : "testnet";

export const HORIZON_URLS: Record<StellarNetwork, string> = {
  testnet:
    process.env.NEXT_PUBLIC_HORIZON_TESTNET_URL ?? "https://horizon-testnet.stellar.org",
  mainnet: process.env.NEXT_PUBLIC_HORIZON_MAINNET_URL ?? "https://horizon.stellar.org"
};

export const SOROBAN_RPC_URLS: Record<StellarNetwork, string> = {
  testnet:
    process.env.NEXT_PUBLIC_SOROBAN_RPC_TESTNET_URL ?? "https://soroban-testnet.stellar.org",
  mainnet:
    process.env.NEXT_PUBLIC_SOROBAN_RPC_MAINNET_URL ?? "https://mainnet.sorobanrpc.com"
};

export const NETWORK_PASSPHRASES: Record<StellarNetwork, string> = {
  testnet: "Test SDF Network ; September 2015",
  mainnet: "Public Global Stellar Network ; September 2015"
};

export const NETWORK_LABELS: Record<StellarNetwork, string> = {
  testnet: "Testnet",
  mainnet: "Mainnet"
};

export const FRIENDBOT_URL = "https://friendbot.stellar.org";

export const NETWORK_STORAGE_KEY = "revyhubx-network";
