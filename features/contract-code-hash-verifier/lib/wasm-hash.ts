import { hash } from "@stellar/stellar-sdk";

export function compareWasm(wasm: Buffer, expected: Buffer): { equal: boolean; actual: string; expected: string } {
  const actual = hash(wasm);
  return {
    equal: actual.equals(expected),
    actual: actual.toString("hex"),
    expected: expected.toString("hex")
  };
}
