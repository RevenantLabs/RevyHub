import { describe, expect, it } from "vitest";
import { MAX_XDR_LENGTH, parseSigningPayloadInspectorInput as parse } from "@/features/signing-payload-inspector/schema";
import { classicXdr } from "@/features/signing-payload-inspector/fixtures/classic-envelope.fixture";

describe("parseSigningPayloadInspectorInput", () => {
  it("rejects an empty paste", () => expect(parse(" \n ")).toEqual({ ok: false, code: "empty_xdr" }));
  it("rejects a raw paste over the cap before stripping whitespace", () => {
    expect(parse(" ".repeat(MAX_XDR_LENGTH + 1) + "AAAA")).toEqual({ ok: false, code: "too_large" });
    expect(parse(" ".repeat(MAX_XDR_LENGTH + 1))).toEqual({ ok: false, code: "too_large" });
  });
  it("accepts the exact text cap but rejects malformed base64", () => {
    expect(parse("A".repeat(MAX_XDR_LENGTH)).ok).toBe(true);
    expect(parse("A".repeat(MAX_XDR_LENGTH + 1))).toEqual({ ok: false, code: "too_large" });
    expect(parse("AAAAA")).toEqual({ ok: false, code: "invalid_xdr" });
    expect(parse("@@@=")).toEqual({ ok: false, code: "invalid_xdr" });
  });
  it("normalizes wrapped base64", () => {
    expect(parse(`${classicXdr.slice(0, 40)}\n${classicXdr.slice(40)}`)).toEqual({
      ok: true, value: { envelope: classicXdr }
    });
  });
});
