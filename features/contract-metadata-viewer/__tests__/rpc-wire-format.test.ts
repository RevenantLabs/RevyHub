import { afterEach, describe, expect, it, vi } from "vitest";
import { Address, hash, xdr } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";
import { fetchContractWasm, MAX_WASM_BYTES } from "../lib/wasm-fetch";
import { runContractMetadataViewer } from "../lib/contractMetadataViewer";
import { customSections } from "../lib/wasm-sections";
import { fullMetadataWasm, metadataContractId } from "../fixtures/full-metadata.fixture";

afterEach(() => vi.unstubAllGlobals());

function mockRpc(wasm: Uint8Array) {
  const digest = hash(Buffer.from(wasm));
  const instance = xdr.LedgerEntryData.contractData(new xdr.ContractDataEntry({
    ext: xdr.ExtensionPoint.fromXDR(Buffer.alloc(4)),
    contract: new Address(metadataContractId).toScAddress(),
    key: xdr.ScVal.scvLedgerKeyContractInstance(),
    durability: xdr.ContractDataDurability.persistent(),
    val: xdr.ScVal.scvContractInstance(new xdr.ScContractInstance({
      executable: xdr.ContractExecutable.contractExecutableWasm(digest), storage: null,
    })),
  })).toXDR("base64");
  const code = xdr.LedgerEntryData.contractCode(new xdr.ContractCodeEntry({
    ext: xdr.ContractCodeEntryExt.fromXDR(Buffer.alloc(4)), hash: digest, code: Buffer.from(wasm),
  })).toXDR("base64");
  const response = (encoded: string) => new Response(JSON.stringify({
    jsonrpc: "2.0", id: 1, result: { latestLedger: 100, entries: [{ xdr: encoded }] },
  }), { headers: { "content-type": "application/json" } });
  const fetchMock = vi.fn().mockResolvedValueOnce(response(instance)).mockResolvedValueOnce(response(code));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("getLedgerEntries wire format", () => {
  it("decodes LedgerEntryData for both the instance and code entries", async () => {
    const fetchMock = mockRpc(fullMetadataWasm);
    expect(await fetchContractWasm(metadataContractId, "testnet")).toEqual({ ok: true, value: fullMetadataWasm });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondRequest = JSON.parse(fetchMock.mock.calls[1]![1].body);
    expect(secondRequest.method).toBe("getLedgerEntries");
    const codeKey = xdr.LedgerKey.fromXDR(secondRequest.params.keys[0], "base64");
    expect(codeKey.contractCode().hash()).toEqual(hash(Buffer.from(fullMetadataWasm)));
  });

  it("reads publisher and environment metadata through the complete RPC path", async () => {
    mockRpc(fullMetadataWasm);
    const result = await runContractMetadataViewer({ contractId: metadataContractId }, "testnet");
    expect(result.ok && result.value.environment).toEqual({ protocol: 23, preRelease: 1 });
    expect(result.ok && result.value.metadata).toContainEqual({ key: "name", value: "Revy demo" });
  });

  it("rejects oversized code before parsing metadata", async () => {
    mockRpc(new Uint8Array(MAX_WASM_BYTES + 1));
    expect(await fetchContractWasm(metadataContractId, "testnet")).toEqual({ ok: false, code: "too_large" });
  });

  it("rejects oversized and overflowing unsigned LEB128 section lengths", () => {
    const header = [0, 97, 115, 109, 1, 0, 0, 0];
    for (const length of [[255, 255, 255, 255, 15], [255, 255, 255, 255, 127]]) {
      expect(customSections(new Uint8Array([...header, 0, ...length]))).toEqual({ ok: false, code: "request_failed" });
    }
  });
});
