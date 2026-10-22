import { xdr } from "@stellar/stellar-sdk";
function uleb(value: number): number[] { const out: number[] = []; do { let byte = value & 0x7f; value >>>= 7; if (value) byte |= 0x80; out.push(byte); } while (value); return out; }
function section(name: string, payload: Uint8Array): Uint8Array { const encoded = new TextEncoder().encode(name); const body = new Uint8Array([...uleb(encoded.length), ...encoded, ...payload]); return new Uint8Array([0, ...uleb(body.length), ...body]); }
const env = xdr.ScEnvMetaEntry.scEnvMetaKindInterfaceVersion(new xdr.ScEnvMetaEntryInterfaceVersion({ protocol: 22, preRelease: 0 })).toXDR();
export const noContractMetaWasm = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, ...section("contractenvmetav0", env)]);
