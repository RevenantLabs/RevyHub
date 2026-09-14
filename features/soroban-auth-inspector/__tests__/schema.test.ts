import { describe, expect, it } from "vitest";
import { parseSorobanAuthInspectorInput } from "@/features/soroban-auth-inspector/schema";
import { buildAuthTreeEnvelopeXdr } from "@/features/soroban-auth-inspector/fixtures/sorobanAuthInspector.fixture";

describe("parseSorobanAuthInspectorInput", () => {
  it("rejects empty input", () => {
    const result = parseSorobanAuthInspectorInput("   ");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects input that is not base64", () => {
    const result = parseSorobanAuthInspectorInput("!!!not-base64!!!");
    expect(result).toEqual({ ok: false, code: "invalid_base64" });
  });

  it("accepts a valid base64 string", () => {
    const xdr = buildAuthTreeEnvelopeXdr();
    const result = parseSorobanAuthInspectorInput(xdr);
    expect(result).toEqual({ ok: true, value: { xdr } });
  });

  it("normalises surrounding whitespace", () => {
    const xdr = buildAuthTreeEnvelopeXdr();
    const result = parseSorobanAuthInspectorInput(`  ${xdr}  `);
    expect(result.ok && result.value.xdr).toBe(xdr);
  });
});
