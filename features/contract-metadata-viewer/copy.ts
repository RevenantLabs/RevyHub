import type { ContractMetadataViewerErrorCode } from "@/features/contract-metadata-viewer/types";
export const copy = {
  formLabel: "Contract ID", formHint: "Enter a public C… Soroban contract address.", submit: "Read metadata", working: "Fetching Wasm…",
  emptyTitle: "No contract inspected", emptyDescription: "Fetch a deployed contract's bounded Wasm and decode its metadata sections locally.",
  resultTitle: "Contract metadata", envTitle: "Environment interface", protocol: "Protocol", preRelease: "Pre-release",
  metadataTitle: "Publisher metadata", nonePublished: "No contractmetav0 metadata was published.", wasmSize: "Wasm bytes"
} as const;
export const errorCopy: Record<ContractMetadataViewerErrorCode, { title: string; description: string }> = {
  invalid_contract_id: { title: "Contract ID is invalid", description: "Enter a checksummed public contract ID beginning with C." },
  contract_not_found: { title: "Contract was not found", description: "Check the selected network and contract ID." },
  missing_env_meta: { title: "Environment metadata is missing", description: "This Wasm does not contain a decodable contractenvmetav0 section." },
  too_large: { title: "Contract Wasm is too large", description: "This viewer decodes at most 1 MiB of Wasm." },
  rate_limited: { title: "RPC rate limit reached", description: "Wait briefly, then retry." },
  request_failed: { title: "RPC request failed", description: "Check the selected network and connection, then retry." }
};
