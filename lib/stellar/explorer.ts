import type { StellarNetwork } from "@/lib/stellar/horizon";

export interface ExplorerLink {
  url: string;
  label: string;
  supported: boolean;
}

const explorerBaseUrls: Record<StellarNetwork, string> = {
  testnet: "https://stellar.expert/explorer/testnet",
  mainnet: "https://stellar.expert/explorer/public"
};

export const supportedExplorerNetworks: StellarNetwork[] = ["testnet", "mainnet"];

export function getContractExplorerLink(
  contractId: string,
  network: StellarNetwork
): ExplorerLink {
  const base = explorerBaseUrls[network];
  return {
    url: `${base}/contract/${contractId}`,
    label: `Open in Stellar Expert (${network})`,
    supported: supportedExplorerNetworks.includes(network)
  };
}

export function getTransactionExplorerLink(
  hash: string,
  network: StellarNetwork
): ExplorerLink {
  const base = explorerBaseUrls[network];
  return {
    url: `${base}/tx/${hash}`,
    label: `Open in Stellar Expert (${network})`,
    supported: supportedExplorerNetworks.includes(network)
  };
}

export function getAccountExplorerLink(
  address: string,
  network: StellarNetwork
): ExplorerLink {
  const base = explorerBaseUrls[network];
  return {
    url: `${base}/account/${address}`,
    label: `Open in Stellar Expert (${network})`,
    supported: supportedExplorerNetworks.includes(network)
  };
}
