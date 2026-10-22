import type { ContractMetadataViewerErrorCode } from "@/features/contract-metadata-viewer/types";
export function toContractMetadataViewerErrorCode(error: unknown): ContractMetadataViewerErrorCode { return (error as { status?: number })?.status === 429 ? "rate_limited" : "request_failed"; }
