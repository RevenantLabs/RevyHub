import { describe, expect, it } from "vitest";
import { nativeToScVal } from "@stellar/stellar-sdk";
import { describeConstructorArgs } from "../lib/constructor-args";

describe("describeConstructorArgs", () => {
  it("returns an empty list for no arguments", () => {
    expect(describeConstructorArgs([])).toEqual([]);
  });

  it("labels each argument with its index and ScVal type", () => {
    const args = [nativeToScVal("hello", { type: "symbol" }), nativeToScVal(42, { type: "u32" })];
    const result = describeConstructorArgs(args);
    expect(result).toEqual([
      { index: 0, scValType: "scvSymbol", display: "hello" },
      { index: 1, scValType: "scvU32", display: "42" }
    ]);
  });

  it("formats a large integer ScVal (bigint) as a plain decimal string", () => {
    const args = [nativeToScVal(9007199254740993n, { type: "i128" })];
    const result = describeConstructorArgs(args);
    expect(result[0].scValType).toBe("scvI128");
    expect(result[0].display).toBe("9007199254740993");
  });
});
