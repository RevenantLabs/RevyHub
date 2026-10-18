import { describe, expect, it } from "vitest";
import { validateToml } from "@/features/toml-validator/lib/tomlValidator";

describe("runTomlValidator", () => {
  it("validates pasted TOML without making a request", async () => {
    const result = await validateToml({ mode: "toml", value: 'ORG_NAME = "Anchor"\nORG_URL = "https://anchor.example"\nACCOUNTS = ["GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"]\n[[CURRENCIES]]\nCODE = "USDC"\nISSUER = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"' });
    expect(result.ok).toBe(true);
    expect(result.ok && result.value.source).toBe("pasted");
    expect(result.ok && result.value.currencies[0]?.codeValid).toBe(true);
  });

  it("returns a typed error for an unreachable domain", async () => {
    const result = await validateToml({ mode: "domain", value: "anchor.example" }, { fetchImpl: async () => { throw new Error("offline"); } });
    expect(result).toMatchObject({ ok: false, code: "toml_unreachable" });
  });

  it("rejects insecure domain fetches", async () => {
    const result = await validateToml({ mode: "domain", value: "http://anchor.example" });
    expect(result).toMatchObject({ ok: false, code: "invalid_domain" });
  });
});
