import { Address, Asset, xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { ErrorCode, ExecutableSummary, PreimageSource } from "../types";

/**
 * Identifies the contract ID preimage source without computing the final
 * deployed address — see the README for why.
 */
export function describePreimageSource(preimage: xdr.ContractIdPreimage): Result<PreimageSource, ErrorCode, string[]> {
  const name = preimage.switch().name;

  if (name === "contractIdPreimageFromAddress") {
    const fromAddress = preimage.fromAddress();
    const address = Address.fromScAddress(fromAddress.address()).toString();
    const saltHex = Buffer.from(fromAddress.salt()).toString("hex");
    return ok({ kind: "address", address, saltHex });
  }

  if (name === "contractIdPreimageFromAsset") {
    const asset = Asset.fromOperation(preimage.fromAsset());
    const label = asset.isNative() ? "native" : `${asset.getCode()}:${asset.getIssuer()}`;
    return ok({ kind: "asset", asset: label });
  }

  return err("unsupported_preimage");
}

export function describeExecutable(executable: xdr.ContractExecutable): ExecutableSummary {
  if (executable.switch().name === "contractExecutableWasm") {
    return { kind: "wasm", hashHex: Buffer.from(executable.wasmHash()).toString("hex") };
  }
  return { kind: "stellar_asset" };
}
