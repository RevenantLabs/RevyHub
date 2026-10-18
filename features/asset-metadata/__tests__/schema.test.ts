import { describe, expect, it } from "vitest";
import { parseDomainInput, wellKnownUrl } from "@/features/asset-metadata/schema";
import { ORIGIN, TOML_URL } from "@/features/asset-metadata/fixtures/assetMetadata.fixture";

describe("parseDomainInput", () => {
  it("accepts a bare domain", () => {
    expect(parseDomainInput("example.com")).toEqual({ ok: true, value: { origin: ORIGIN } });
  });

  it("accepts an explicit https URL", () => {
    expect(parseDomainInput("https://example.com")).toEqual({ ok: true, value: { origin: ORIGIN } });
  });

  it("strips any path the user typed", () => {
    const result = parseDomainInput("https://example.com/some/where?a=1#b");
    expect(result.ok && result.value.origin).toBe(ORIGIN);
  });

  it("keeps an explicit port", () => {
    const result = parseDomainInput("https://example.com:8443");
    expect(result.ok && result.value.origin).toBe("https://example.com:8443");
  });

  it("rejects empty input", () => {
    expect(parseDomainInput("  ")).toEqual({ ok: false, code: "empty_input" });
  });

  it.each(["http://example.com", "ftp://example.com", "//example.com"])(
    "rejects %s as an insecure scheme",
    (input) => {
      expect(parseDomainInput(input)).toEqual({ ok: false, code: "insecure_scheme" });
    }
  );

  it("rejects a bare IP address", () => {
    expect(parseDomainInput("192.168.0.1")).toEqual({ ok: false, code: "invalid_domain" });
  });

  it("rejects a URL carrying credentials", () => {
    expect(parseDomainInput("https://user:pass@example.com")).toEqual({
      ok: false,
      code: "invalid_domain"
    });
  });

  it("rejects a single-label hostname", () => {
    expect(parseDomainInput("localhost")).toEqual({ ok: false, code: "invalid_domain" });
  });
});

describe("wellKnownUrl", () => {
  it("always appends the SEP-0001 path", () => {
    expect(wellKnownUrl(ORIGIN)).toBe(TOML_URL);
  });
});
