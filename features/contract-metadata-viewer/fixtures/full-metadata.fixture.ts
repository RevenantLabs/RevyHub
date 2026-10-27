import { StrKey, xdr } from "@stellar/stellar-sdk";
export const metadataContractId = StrKey.encodeContract(Buffer.alloc(32, 71));
function uleb(value: number): number[] { const out: number[] = []; do { let byte = value & 0x7f; value >>>= 7; if (value) byte |= 0x80; out.push(byte); } while (value); return out; }
function custom(name: string, payload: Uint8Array): Uint8Array { const nameBytes = new TextEncoder().encode(name); const content = new Uint8Array([...uleb(nameBytes.length), ...nameBytes, ...payload]); return new Uint8Array([0, ...uleb(content.length), ...content]); }
const env = xdr.ScEnvMetaEntry.scEnvMetaKindInterfaceVersion(new xdr.ScEnvMetaEntryInterfaceVersion({ protocol: 23, preRelease: 1 })).toXDR();
const meta = [
  xdr.ScMetaEntry.scMetaV0(new xdr.ScMetaV0({ key: "name", val: "Revy demo" })).toXDR(),
  xdr.ScMetaEntry.scMetaV0(new xdr.ScMetaV0({ key: "version", val: "1.0.0" })).toXDR()
];
export const fullMetadataWasm = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, ...custom("contractenvmetav0", env), ...custom("contractmetav0", Buffer.concat(meta))]);
