import { describe, expect, it } from "vitest";
import { readHomeDomain, stellarTomlUrl } from "@/features/regulated-asset-inspector/lib/home-domain";

describe("readHomeDomain", () => {
  it("returns a trimmed domain", () => {
    expect(readHomeDomain({ home_domain: "Issuer.Example" })).toEqual({
      ok: true,
      value: "issuer.example"
    });
  });

  it("treats a missing domain as its own error", () => {
    expect(readHomeDomain({ home_domain: "  " })).toEqual({ ok: false, code: "missing_home_domain" });
  });

  it("builds the well-known toml URL", () => {
    expect(stellarTomlUrl("issuer.example")).toBe("https://issuer.example/.well-known/stellar.toml");
  });
});
