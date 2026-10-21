import { describe, expect, it } from "vitest";
import { xdr, Address, Asset, Keypair } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";
import { describeExecutable, describePreimageSource } from "../lib/preimage-source";

const keypair = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 6));
const accountId = keypair.publicKey();

describe("describePreimageSource", () => {
  it("decodes an address-derived preimage with its salt", () => {
    const salt = Buffer.alloc(32, 15);
    const preimage = xdr.ContractIdPreimage.contractIdPreimageFromAddress(
      new xdr.ContractIdPreimageFromAddress({ address: new Address(accountId).toScAddress(), salt })
    );
    const result = describePreimageSource(preimage);
    expect(result.ok).toBe(true);
    expect(result.ok && result.value).toEqual({ kind: "address", address: accountId, saltHex: salt.toString("hex") });
  });

  it("decodes an asset-derived preimage", () => {
    const asset = new Asset("USDX", accountId);
    const preimage = xdr.ContractIdPreimage.contractIdPreimageFromAsset(asset.toXDRObject());
    const result = describePreimageSource(preimage);
    expect(result.ok).toBe(true);
    expect(result.ok && result.value).toEqual({ kind: "asset", asset: `USDX:${accountId}` });
  });

  it("labels the native asset as 'native' rather than CODE:ISSUER", () => {
    const preimage = xdr.ContractIdPreimage.contractIdPreimageFromAsset(Asset.native().toXDRObject());
    const result = describePreimageSource(preimage);
    expect(result.ok && result.value).toEqual({ kind: "asset", asset: "native" });
  });
});

describe("describeExecutable", () => {
  it("decodes a wasm executable", () => {
    const hash = Buffer.alloc(32, 21);
    const executable = xdr.ContractExecutable.contractExecutableWasm(hash);
    expect(describeExecutable(executable)).toEqual({ kind: "wasm", hashHex: hash.toString("hex") });
  });

  it("decodes a built-in Stellar Asset Contract executable", () => {
    const executable = xdr.ContractExecutable.contractExecutableStellarAsset();
    expect(describeExecutable(executable)).toEqual({ kind: "stellar_asset" });
  });
});
