import { describe, expect, it } from "vitest"; import { Keypair } from "@stellar/stellar-sdk"; import { parseContractMetadataViewerInput } from "@/features/contract-metadata-viewer/schema"; import { metadataContractId } from "@/features/contract-metadata-viewer/fixtures/full-metadata.fixture";
describe("parseContractMetadataViewerInput", () => {
  it("accepts a checksummed contract ID", () => expect(parseContractMetadataViewerInput(` ${metadataContractId} `)).toEqual({ ok: true, value: { contractId: metadataContractId } }));
  it("rejects a secret before echoing it", () => expect(parseContractMetadataViewerInput(Keypair.random().secret())).toEqual({ ok: false, code: "invalid_contract_id" }));
});
