import { describe, expect, it } from "vitest";
import {
  MAX_XDR_LENGTH,
  looksLikeSecretKey,
  parsePreconditionsInput
} from "@/features/preconditions-explainer/schema";
import {
  notBase64,
  openXdr,
  secretSeed
} from "@/features/preconditions-explainer/fixtures/preconditionsExplainer.fixture";

describe("parsePreconditionsInput", () => {
  it("accepts a well-formed envelope", () => {
    expect(parsePreconditionsInput(openXdr)).toEqual({ ok: true, value: { envelope: openXdr } });
  });

  it("strips whitespace introduced by a wrapped copy", () => {
    const wrapped = openXdr.replace(/(.{20})/g, "$1\n  ");
    expect(parsePreconditionsInput(wrapped)).toEqual({ ok: true, value: { envelope: openXdr } });
  });

  it("reports an empty submission separately from a bad one", () => {
    expect(parsePreconditionsInput("")).toEqual({ ok: false, code: "empty_input" });
    expect(parsePreconditionsInput("   \n\t ")).toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects text that is not base64", () => {
    expect(parsePreconditionsInput(notBase64)).toEqual({ ok: false, code: "invalid_xdr" });
  });

  it("rejects base64 whose length is not a multiple of four", () => {
    expect(parsePreconditionsInput("AAAAA")).toEqual({ ok: false, code: "invalid_xdr" });
  });

  it("rejects a secret seed before it can reach the decoder", () => {
    const parsed = parsePreconditionsInput(secretSeed);

    expect(parsed).toEqual({ ok: false, code: "invalid_xdr" });
    expect(JSON.stringify(parsed)).not.toContain(secretSeed);
  });

  it("treats a secret seed as a secret even though it is valid base64 syntax", () => {
    // 56 base32 characters are also legal base64 of a legal length, which is
    // exactly why the prefix check has to come first.
    expect(secretSeed).toHaveLength(56);
    expect(secretSeed.length % 4).toBe(0);
    expect(looksLikeSecretKey(secretSeed)).toBe(true);
  });

  describe("length boundary", () => {
    it("accepts input exactly at the cap", () => {
      const atCap = "A".repeat(MAX_XDR_LENGTH);
      expect(parsePreconditionsInput(atCap)).toEqual({ ok: true, value: { envelope: atCap } });
    });

    it("rejects input past the cap", () => {
      expect(parsePreconditionsInput("A".repeat(MAX_XDR_LENGTH + 4))).toEqual({
        ok: false,
        code: "invalid_xdr"
      });
    });
  });
});
