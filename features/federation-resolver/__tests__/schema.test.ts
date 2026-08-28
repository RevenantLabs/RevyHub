import { describe, expect, it } from "vitest";
import {
  NAME_MAX_LENGTH,
  formatFederationAddress,
  parseFederationInput
} from "@/features/federation-resolver/schema";

describe("parseFederationInput", () => {
  it("splits a well-formed address", () => {
    expect(parseFederationInput("alice*stellar.org")).toEqual({
      ok: true,
      value: { name: "alice", domain: "stellar.org" }
    });
  });

  it("splits on the FIRST asterisk, as SEP-0002 requires", () => {
    // With `indexOf` the domain becomes "b*example.com", which is not a valid
    // hostname, so the address is rejected. `lastIndexOf` would have accepted
    // it as alice-style name "a*b" at example.com — a different, wrong answer.
    expect(parseFederationInput("a*b*example.com")).toEqual({
      ok: false,
      code: "invalid_syntax"
    });
  });

  it("lower-cases the domain so built URLs are deterministic", () => {
    const result = parseFederationInput("Alice*Stellar.ORG");
    expect(result.ok && result.value).toEqual({ name: "Alice", domain: "stellar.org" });
  });

  it("rejects empty input with its own code", () => {
    expect(parseFederationInput("   ")).toEqual({ ok: false, code: "empty_input" });
  });

  it.each([
    "no-asterisk.com",
    "*stellar.org",
    "alice*",
    "alice*localhost",
    "alice*bad_domain.com",
    "ali ce*stellar.org",
    "alice!*stellar.org"
  ])("rejects %s as invalid syntax", (input) => {
    expect(parseFederationInput(input)).toEqual({ ok: false, code: "invalid_syntax" });
  });

  it("rejects a name longer than the federation limit", () => {
    const long = `${"a".repeat(NAME_MAX_LENGTH + 1)}*stellar.org`;
    expect(parseFederationInput(long)).toEqual({ ok: false, code: "invalid_syntax" });
  });

  it("accepts a name at exactly the limit", () => {
    expect(parseFederationInput(`${"a".repeat(NAME_MAX_LENGTH)}*stellar.org`).ok).toBe(true);
  });

  it("accepts dots, underscores and hyphens in the name", () => {
    expect(parseFederationInput("first.last_1-2*stellar.org").ok).toBe(true);
  });
});

describe("formatFederationAddress", () => {
  it("rebuilds the canonical name*domain form", () => {
    expect(formatFederationAddress({ name: "alice", domain: "stellar.org" })).toBe(
      "alice*stellar.org"
    );
  });
});
