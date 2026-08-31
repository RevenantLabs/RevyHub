import { describe, expect, it } from "vitest";
import { formatDomain, formatKey, formatTomlUrl } from "@/features/sep7-signature-verifier/lib/format";

describe("signature verifier formatting", () => {
  it("normalises the displayed domain", () => {
    expect(formatDomain(" Example.COM ")).toBe("example.com");
  });

  it("leaves key and URL values intact", () => {
    expect(formatKey("GABC")).toBe("GABC");
    expect(formatTomlUrl("https://example.com/.well-known/stellar.toml")).toContain("stellar.toml");
  });
});
