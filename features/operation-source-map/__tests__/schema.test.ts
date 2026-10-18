import { describe, expect, it } from "vitest";
import { MAX_ENVELOPE_LENGTH, parseSourceMapInput } from "@/features/operation-source-map/schema";
import {
  mixedOverridesXdr,
  notBase64,
  secretSeed
} from "@/features/operation-source-map/fixtures/operationSourceMap.fixture";

describe("parseSourceMapInput", () => {
  it("rejects empty input", () => {
    expect(parseSourceMapInput("   \n ")).toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects text that is not base64", () => {
    expect(parseSourceMapInput(notBase64)).toEqual({ ok: false, code: "invalid_input" });
  });

  it("rejects base64 whose length is not a multiple of four", () => {
    expect(parseSourceMapInput("AAAAA")).toEqual({ ok: false, code: "invalid_input" });
  });

  it("refuses a secret seed without echoing it", () => {
    const result = parseSourceMapInput(secretSeed);

    // The detail says why so the UI can clear the field; it never carries the value.
    expect(result).toEqual({ ok: false, code: "invalid_input", detail: "secret_key" });
    expect(JSON.stringify(result)).not.toContain(secretSeed);
  });

  it("flags only a secret seed for redaction, not any other bad paste", () => {
    const badPaste = parseSourceMapInput(notBase64);

    expect(badPaste).toEqual({ ok: false, code: "invalid_input" });
    expect(badPaste.ok === false && badPaste.detail).toBeUndefined();
  });

  it("accepts input exactly at the length cap", () => {
    expect(parseSourceMapInput("A".repeat(MAX_ENVELOPE_LENGTH)).ok).toBe(true);
  });

  it("rejects input past the length cap", () => {
    expect(parseSourceMapInput("A".repeat(MAX_ENVELOPE_LENGTH + 4))).toEqual({
      ok: false,
      code: "input_too_large"
    });
  });

  it("strips whitespace from a wrapped paste", () => {
    const wrapped = `${mixedOverridesXdr.slice(0, 40)}\n  ${mixedOverridesXdr.slice(40)}`;
    expect(parseSourceMapInput(wrapped)).toEqual({
      ok: true,
      value: { envelope: mixedOverridesXdr }
    });
  });

  it("accepts a well-formed envelope", () => {
    expect(parseSourceMapInput(mixedOverridesXdr).ok).toBe(true);
  });
});
