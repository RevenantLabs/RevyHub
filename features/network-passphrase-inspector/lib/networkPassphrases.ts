import { Networks } from "@stellar/stellar-sdk";
import type {
  NetworkInfo,
  NetworkPassphraseResult,
  NetworkType,
} from "@/features/network-passphrase-inspector/types";

export const STELLAR_NETWORKS: NetworkInfo[] = [
  {
    name: "Global Stellar Network",
    type: "mainnet",
    passphrase: Networks.PUBLIC,
    horizonUrl: "https://horizon.stellar.org",
    sorobanEnabled: true,
    isDefault: true,
  },
  {
    name: "Test SDF Network",
    type: "testnet",
    passphrase: Networks.TESTNET,
    horizonUrl: "https://horizon-testnet.stellar.org",
    sorobanEnabled: true,
    isDefault: false,
  },
  {
    name: "Test Future Network",
    type: "futurenet",
    passphrase: Networks.FUTURENET,
    horizonUrl: "https://horizon-futurenet.stellar.org",
    sorobanEnabled: false,
    isDefault: false,
  },
];

export function getNetworkPassphraseReference(): NetworkPassphraseResult {
  const byType: Record<NetworkType, NetworkInfo[]> = {
    mainnet: STELLAR_NETWORKS.filter(n => n.type === "mainnet"),
    testnet: STELLAR_NETWORKS.filter(n => n.type === "testnet"),
    futurenet: STELLAR_NETWORKS.filter(n => n.type === "futurenet"),
    custom: [],
  };
  return { networks: STELLAR_NETWORKS, byType };
}

export function searchNetworks(query: string, type?: string): NetworkInfo[] {
  let results = STELLAR_NETWORKS;

  if (type && type !== "all") {
    results = results.filter(n => n.type === type);
  }

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      n =>
        n.name.toLowerCase().includes(q) ||
        n.passphrase.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q)
    );
  }

  return results;
}

export function getNetworkByPassphrase(passphrase: string): NetworkInfo | undefined {
  return STELLAR_NETWORKS.find(n => n.passphrase === passphrase);
}

export function getMainnet(): NetworkInfo {
  return STELLAR_NETWORKS.find(n => n.type === "mainnet")!;
}

export function getTestnet(): NetworkInfo {
  return STELLAR_NETWORKS.find(n => n.type === "testnet")!;
}
