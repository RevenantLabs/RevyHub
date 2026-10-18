import { expect, it } from "vitest";
import { compareWasm } from "../lib/wasm-hash";
import { mismatchBytes, wasmBytes, wasmDigest } from "../fixtures/wasm-contract.fixture";

it("matches the fixture bytes and rejects a different payload", () => {
  const match = compareWasm(wasmBytes, wasmDigest);
  expect(match.equal).toBe(true);
  expect(match.actual).toBe(wasmDigest.toString("hex"));
  const mismatch = compareWasm(mismatchBytes, wasmDigest);
  expect(mismatch.equal).toBe(false);
  expect(mismatch.actual).not.toBe(mismatch.expected);
});
