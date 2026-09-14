export interface GeneratedKeypair {
  publicKey: string;
  seed: string;
  network: "testnet";
}

export interface KeypairValidation {
  valid: boolean;
  type: "public" | "seed" | "unknown";
  message: string;
}

export type KeypairErrorCode =
  | "empty_input"
  | "invalid_seed"
  | "invalid_public_key";
