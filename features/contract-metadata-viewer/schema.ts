import { StrKey } from "@stellar/stellar-sdk"; import { err, ok, type Result } from "@/core/result/result"; import type { ContractMetadataViewerErrorCode, ContractMetadataViewerInput } from "@/features/contract-metadata-viewer/types";
export function parseContractMetadataViewerInput(raw: string): Result<ContractMetadataViewerInput, ContractMetadataViewerErrorCode> {
  const contractId = raw.trim();
  if (contractId.startsWith("S") || !StrKey.isValidContract(contractId)) return err("invalid_contract_id");
  return ok({ contractId });
}
