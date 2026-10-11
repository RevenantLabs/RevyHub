import { xdr } from "@stellar/stellar-sdk";
import type { ScvalCodecResult } from "@/features/scval-codec/types";

export const decodedU32Result: ScvalCodecResult = {
  mode: "decode",
  input: xdr.ScVal.scvU32(42).toXDR("base64"),
  output: "42",
  json: 42
};

export const decodedStringResult: ScvalCodecResult = {
  mode: "decode",
  input: xdr.ScVal.scvString("hello").toXDR("base64"),
  output: '"hello"',
  json: "hello"
};

export const decodedVecResult: ScvalCodecResult = {
  mode: "decode",
  input: xdr.ScVal.scvVec([xdr.ScVal.scvU32(1), xdr.ScVal.scvU32(2)]).toXDR("base64"),
  output: "[\n  1,\n  2\n]",
  json: [1, 2]
};

export const encodedJsonStringResult: ScvalCodecResult = {
  mode: "encode",
  input: '"hello"',
  output: xdr.ScVal.scvString("hello").toXDR("base64"),
  base64: xdr.ScVal.scvString("hello").toXDR("base64")
};

export const encodedJsonU128Result: ScvalCodecResult = {
  mode: "encode",
  input: JSON.stringify({ _type: "u128", value: "340282366920938463463374607431768211455" }),
  output: xdr.ScVal.scvU128(
    new xdr.UInt128Parts({
      hi: xdr.Uint64.fromString("18446744073709551615"),
      lo: xdr.Uint64.fromString("18446744073709551615")
    })
  ).toXDR("base64"),
  base64: xdr.ScVal.scvU128(
    new xdr.UInt128Parts({
      hi: xdr.Uint64.fromString("18446744073709551615"),
      lo: xdr.Uint64.fromString("18446744073709551615")
    })
  ).toXDR("base64")
};
