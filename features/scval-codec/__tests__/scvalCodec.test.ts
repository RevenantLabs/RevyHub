import { xdr } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";
import { jsonToScVal, runScvalCodec, scValToJson } from "@/features/scval-codec/lib/scvalCodec";

describe("runScvalCodec", () => {
  it("decodes a u32 ScVal to JSON", async () => {
    const base64 = xdr.ScVal.scvU32(42).toXDR("base64");
    const result = await runScvalCodec({ value: base64, mode: "decode" }, "testnet");
    expect(result.ok && result.value.output).toBe("42");
  });

  it("encodes a JSON string to an ScVal", async () => {
    const result = await runScvalCodec({ value: '"hello"', mode: "encode" }, "testnet");
    expect(result.ok && result.value.output).toBe(xdr.ScVal.scvString("hello").toXDR("base64"));
  });

  it("round-trips a complex value", async () => {
    const original = xdr.ScVal.scvMap([
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("amount"),
        val: xdr.ScVal.scvU128(
          new xdr.UInt128Parts({
            hi: xdr.Uint64.fromString("0"),
            lo: xdr.Uint64.fromString("1000000")
          })
        )
      })
    ]);
    const decoded = scValToJson(original);
    const encoded = jsonToScVal(decoded);
    expect(encoded.toXDR("base64")).toBe(original.toXDR("base64"));
  });
});
