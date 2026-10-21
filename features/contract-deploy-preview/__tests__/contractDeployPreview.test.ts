import { describe, expect, it } from "vitest";
import { previewContractDeploy } from "../lib/contractDeployPreview";
import { sample, sourceAccountId } from "../fixtures/contractDeployPreview.fixture";
import { envelope as wasmHashEnvelope } from "../fixtures/wasm-hash-preimage.fixture";
import { asset, envelope as assetEnvelope } from "../fixtures/asset-preimage.fixture";

describe("previewContractDeploy", () => {
  it("decodes a CreateContractV2 envelope: address preimage, wasm executable, two constructor args", () => {
    const result = previewContractDeploy({ envelope: sample.envelope });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.isV2).toBe(true);
    expect(result.value.preimage).toEqual({ kind: "address", address: sourceAccountId, saltHex: Buffer.alloc(32, 9).toString("hex") });
    expect(result.value.executable.kind).toBe("wasm");
    expect(result.value.constructorArgs).toHaveLength(2);
    expect(result.value.constructorArgs[0].scValType).toBe("scvSymbol");
    expect(result.value.constructorArgs[1].scValType).toBe("scvU32");
  });

  it("decodes a CreateContract (v1) envelope with no constructor arguments", () => {
    const result = previewContractDeploy({ envelope: wasmHashEnvelope });
    expect(result.ok).toBe(true);
    expect(result.ok && result.value.isV2).toBe(false);
    expect(result.ok && result.value.constructorArgs).toHaveLength(0);
  });

  it("decodes an asset-derived preimage with the built-in stellar_asset executable", () => {
    const result = previewContractDeploy({ envelope: assetEnvelope });
    expect(result.ok).toBe(true);
    expect(result.ok && result.value.preimage).toEqual({ kind: "asset", asset: `${asset.getCode()}:${asset.getIssuer()}` });
    expect(result.ok && result.value.executable).toEqual({ kind: "stellar_asset" });
  });
});
