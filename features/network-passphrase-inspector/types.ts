export type NetworkType = "mainnet" | "testnet" | "futurenet" | "custom";

export interface NetworkInfo {
  name: string;
  type: NetworkType;
  passphrase: string;
  horizonUrl: string;
  rpcUrl?: string;
  sorobanEnabled: boolean;
  isDefault: boolean;
}

export interface NetworkPassphraseResult {
  networks: NetworkInfo[];
  byType: Record<NetworkType, NetworkInfo[]>;
}

export type NetworkErrorCode =
  | "empty_input"
  | "invalid_passphrase"
  | "network_not_found";
