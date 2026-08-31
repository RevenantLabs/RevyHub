import { Keypair } from "@stellar/stellar-sdk";
import type { FreighterApi } from "@/features/freighter-connect/types";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const walletPublicKey = seed(1).publicKey();

/** Builds a fake `window`-like target carrying a Freighter API. */
export function windowWith(api: Partial<FreighterApi> | undefined) {
  return api ? { freighterApi: api } : {};
}

export const connectedApi: FreighterApi = {
  isConnected: async () => true,
  isAllowed: async () => true,
  setAllowed: async () => true,
  getPublicKey: async () => walletPublicKey,
  getNetwork: async () => "TESTNET"
};

export const mainnetApi: FreighterApi = {
  ...connectedApi,
  getNetwork: async () => "PUBLIC"
};

export const futurenetApi: FreighterApi = {
  ...connectedApi,
  getNetwork: async () => "FUTURENET"
};

export const lockedApi: FreighterApi = {
  isConnected: async () => true,
  isAllowed: async () => false,
  setAllowed: async () => true,
  getPublicKey: async () => walletPublicKey,
  getNetwork: async () => "TESTNET"
};

export const throwingApi: FreighterApi = {
  isAllowed: async () => true,
  getPublicKey: async () => {
    throw new Error("wallet is locked");
  },
  getNetwork: async () => "TESTNET"
};

/** An older or newer extension exposing a different surface. */
export const incompleteApi = { isConnected: async () => true } as FreighterApi;
