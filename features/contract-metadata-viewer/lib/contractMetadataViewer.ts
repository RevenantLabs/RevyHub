import { ok, type Result } from "@/core/result/result"; import type { StellarNetwork } from "@/core/network/types"; import { fetchContractWasm } from "@/features/contract-metadata-viewer/lib/wasm-fetch"; import { customSections } from "@/features/contract-metadata-viewer/lib/wasm-sections"; import { decodeEnvMeta } from "@/features/contract-metadata-viewer/lib/env-meta-decode"; import { decodeContractMeta } from "@/features/contract-metadata-viewer/lib/contract-meta-decode"; import type { ContractMetadataViewerErrorCode, ContractMetadataViewerInput, ContractMetadataViewerResult } from "@/features/contract-metadata-viewer/types";
export async function runContractMetadataViewer(input: ContractMetadataViewerInput, network: StellarNetwork, signal?: AbortSignal): Promise<Result<ContractMetadataViewerResult, ContractMetadataViewerErrorCode>> {
  const fetched = await fetchContractWasm(input.contractId, network, signal); if (!fetched.ok) return fetched;
  const sections = customSections(fetched.value); if (!sections.ok) return sections;
  const environment = decodeEnvMeta(sections.value.get("contractenvmetav0") ?? []); if (!environment.ok) return environment;
  const metadata = decodeContractMeta(sections.value.get("contractmetav0") ?? []); if (!metadata.ok) return metadata;
  return ok({ contractId: input.contractId, network, wasmBytes: fetched.value.length, environment: environment.value, metadata: metadata.value });
}
