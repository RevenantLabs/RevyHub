import { Address, Keypair, xdr } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";

export const owner = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 4)).publicKey();

function fn(name: string, inputs: Array<[string, xdr.ScSpecTypeDef]>) {
  return xdr.ScSpecEntry.scSpecEntryFunctionV0(
    new xdr.ScSpecFunctionV0({
      doc: Buffer.from(""),
      name: Buffer.from(name),
      inputs: inputs.map(([inputName, type]) => new xdr.ScSpecFunctionInputV0({ doc: Buffer.from(""), name: Buffer.from(inputName), type })),
      outputs: [xdr.ScSpecTypeDef.scSpecTypeVoid()]
    })
  ).toXDR("base64");
}

export const ownerStruct = xdr.ScSpecEntry.scSpecEntryUdtStructV0(
  new xdr.ScSpecUdtStructV0({
    doc: Buffer.from(""),
    lib: Buffer.from(""),
    name: Buffer.from("Owner"),
    fields: [
      new xdr.ScSpecUdtStructFieldV0({
        doc: Buffer.from(""),
        name: Buffer.from("owner"),
        type: xdr.ScSpecTypeDef.scSpecTypeAddress()
      })
    ]
  })
).toXDR("base64");

export const transferFn = fn("transfer", [["amount", xdr.ScSpecTypeDef.scSpecTypeU32()]]);
export const setOwnerFn = fn("set_owner", [
  ["amount", xdr.ScSpecTypeDef.scSpecTypeU32()],
  ["who", xdr.ScSpecTypeDef.scSpecTypeUdt(new xdr.ScSpecTypeUdt({ name: Buffer.from("Owner") }))]
]);
export const unsupportedFn = fn("explode", [[
  "out",
  xdr.ScSpecTypeDef.scSpecTypeResult(new xdr.ScSpecTypeResult({
    okType: xdr.ScSpecTypeDef.scSpecTypeVoid(),
    errorType: xdr.ScSpecTypeDef.scSpecTypeU32()
  }))
]]);

export const amountArg = xdr.ScVal.scvU32(7).toXDR("base64");
export const wrongOwnerArg = xdr.ScVal.scvMap([
  new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("owner"), val: xdr.ScVal.scvU32(1) })
]).toXDR("base64");
export const goodOwnerArg = xdr.ScVal.scvMap([
  new xdr.ScMapEntry({
    key: xdr.ScVal.scvSymbol("owner"),
    val: xdr.ScVal.scvAddress(new Address(owner).toScAddress())
  })
]).toXDR("base64");

export const specText = [ownerStruct, transferFn, setOwnerFn].join("\n");
export const sample = {
  spec: specText,
  functionName: "transfer",
  arguments: amountArg
};
