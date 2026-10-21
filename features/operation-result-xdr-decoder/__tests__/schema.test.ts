import { describe, expect, it } from "vitest";
import { parseOperationResultXdrDecoderInput as parse } from "../schema";
import { successHash } from "../fixtures/operationResultXdrDecoder.fixture";
describe("hash input", () => {
  it("accepts exactly 32 bytes in hex and normalizes case", () => expect(parse(` ${successHash.toUpperCase()} `)).toEqual({ ok: true, value: { hash: successHash } }));
  it.each(["", "a".repeat(63), "g".repeat(64), "S".repeat(56), "a".repeat(65)])("rejects invalid or secret-like input without echoing it", (raw) => expect(parse(raw)).toEqual({ ok: false, code: "invalid_hash" }));
});
