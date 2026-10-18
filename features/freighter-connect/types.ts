import type { StellarNetwork } from "@/core/network/types";

/** What the extension reports, normalised. `unknown` covers futurenet and custom networks. */
export type WalletNetwork = StellarNetwork | "unknown";

export interface FreighterApi {
  isConnected?: () => Promise<boolean>;
  isAllowed?: () => Promise<boolean>;
  setAllowed?: () => Promise<boolean>;
  getPublicKey?: () => Promise<string>;
  getNetwork?: () => Promise<string>;
}

export interface WalletSnapshot {
  installed: boolean;
  allowed: boolean;
  publicKey?: string;
  rawNetwork?: string;
  network: WalletNetwork;
}

export type FreighterErrorCode =
  | "not_installed"
  | "not_allowed"
  | "api_incomplete"
  | "read_failed";
