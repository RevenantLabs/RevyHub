export interface TestnetKeypairGeneratorInput {
  label?: string;
  checkNetwork?: boolean;
}

export type NetworkCheckStatus = "unfunded" | "funded" | "skipped";

export interface TestnetKeypairGeneratorResult {
  publicKey: string;
  secretSeed: string;
  label?: string;
  network: "testnet";
  networkCheckStatus: NetworkCheckStatus;
  friendbotUrl: string;
  generatedAt: string;
}

export type TestnetKeypairGeneratorErrorCode =
  | "secret_input_prohibited"
  | "label_too_long"
  | "horizon_unavailable"
  | "rate_limited"
  | "request_failed";
