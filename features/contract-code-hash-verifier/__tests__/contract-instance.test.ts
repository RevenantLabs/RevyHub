import { expect, it } from "vitest";
import { decodeInstance } from "../lib/contract-instance";
import { builtinInstanceXdr } from "../fixtures/builtin-contract.fixture";
import { instanceXdr, wasmDigest } from "../fixtures/wasm-contract.fixture";

it("classifies a Wasm instance and a built-in asset instance", () => {
  const wasm = decodeInstance(instanceXdr);
  expect(wasm.ok && wasm.value.kind).toBe("wasm");
  expect(wasm.ok && wasm.value.kind === "wasm" && wasm.value.hash.equals(wasmDigest)).toBe(true);
  const builtin = decodeInstance(builtinInstanceXdr);
  expect(builtin.ok && builtin.value.kind).toBe("builtin");
  expect(decodeInstance("AAAA").ok).toBe(false);
});
