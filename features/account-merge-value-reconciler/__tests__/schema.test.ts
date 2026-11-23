import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { parseAccountMergeValueReconcilerInput as parse, containsSecretSeed, MAX_XDR_LENGTH } from "../schema";
import { normalInput } from "../fixtures/normal.fixture";

const seed = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 9)).secret();

describe("input bounds", () => {
  it("accepts valid base64 XDR and an empty metadata field", () => {
    expect(parse(normalInput).ok).toBe(true);
    expect(parse({ ...normalInput, metadataXdr: "" })).toEqual({ ok: true, value: { ...normalInput, metadataXdr: "" } });
  });

  it("strips pasted line wrapping before validation", () => {
    const wrapped = normalInput.envelope.replace(/(.{60})/g, "$1\n");
    expect(parse({ ...normalInput, envelope: wrapped })).toEqual({ ok: true, value: normalInput });
  });

  it("rejects a missing envelope or result", () => {
    expect(parse({ ...normalInput, resultXdr: "" })).toEqual({ ok: false, code: "invalid_input" });
    expect(parse({ ...normalInput, envelope: "   " })).toEqual({ ok: false, code: "invalid_input" });
  });

  it("rejects malformed base64 and non-string fields", () => {
    expect(parse({ ...normalInput, envelope: "???" })).toEqual({ ok: false, code: "invalid_input" });
    expect(parse({ ...normalInput, resultXdr: "AAAA" })).toEqual({ ok: false, code: "invalid_input" });
    expect(parse({ ...normalInput, metadataXdr: "AAAAAAA" })).toEqual({ ok: false, code: "invalid_input" });
    expect(parse({ ...normalInput, metadataXdr: 42 as unknown as string })).toEqual({ ok: false, code: "invalid_input" });
  });

  it("enforces the per-field length at its exact boundary", () => {
    expect(parse({ ...normalInput, metadataXdr: "A".repeat(MAX_XDR_LENGTH) }).ok).toBe(true);
    expect(parse({ ...normalInput, metadataXdr: "A".repeat(MAX_XDR_LENGTH + 1) })).toEqual({ ok: false, code: "too_large" });
  });

  it("rejects checksum-valid secret seeds before decoding, without false positives", () => {
    expect(parse({ ...normalInput, envelope: seed })).toEqual({ ok: false, code: "invalid_input" });
    expect(parse({ ...normalInput, metadataXdr: `note ${seed}` })).toEqual({ ok: false, code: "invalid_input" });
    expect(containsSecretSeed(`S${"A".repeat(55)}`)).toBe(false);
  });
});
