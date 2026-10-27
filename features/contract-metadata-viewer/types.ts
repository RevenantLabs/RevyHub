import type { StellarNetwork } from "@/core/network/types";
export interface ContractMetadataViewerInput { contractId: string }
export interface EnvVersion { protocol: number; preRelease: number }
export interface MetadataEntry { key: string; value: string }
export interface ContractMetadataViewerResult {
  contractId: string; network: StellarNetwork; wasmBytes: number;
  environment: EnvVersion; metadata: MetadataEntry[];
}
export type ContractMetadataViewerErrorCode = "invalid_contract_id" | "contract_not_found" | "missing_env_meta" | "too_large" | "rate_limited" | "request_failed";
