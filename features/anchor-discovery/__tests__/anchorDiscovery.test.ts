import { describe, expect, it } from "vitest";
import { discoverAnchor } from "@/features/anchor-discovery/lib/anchorDiscovery";

describe("runAnchorDiscovery", () => {
  it("classifies a valid TOML response", async () => {
    const result = await discoverAnchor(
      { domain: "anchor.example" },
      { fetchImpl: async () => new Response('TRANSFER_SERVER = "https://anchor.example/sep6"\nWEB_AUTH_ENDPOINT = "https://anchor.example/auth"\nSIGNING_KEY = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"\n[[CURRENCIES]]\ncode = "USDC"\nissuer = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"') },
    );
    expect(result.ok).toBe(true);
    expect(result.ok && result.value.services.sep6).toBe(true);
    expect(result.ok && result.value.currencies[0]?.code).toBe("USDC");
  });

  it("distinguishes a reachable document with no services", async () => {
    const result = await discoverAnchor({ domain: "anchor.example" }, { fetchImpl: async () => new Response("NETWORK_PASSPHRASE = \"test\"") });
    expect(result).toMatchObject({ ok: false, code: "no_services" });
  });

  it("keeps SEP-24 separate from SEP-6", async () => {
    const result = await discoverAnchor(
      { domain: "anchor.example" },
      { fetchImpl: async () => new Response('TRANSFER_SERVER_SEP0024 = "https://anchor.example/sep24"') },
    );
    expect(result).toMatchObject({ ok: true, value: { services: { sep6: false, sep24: true } } });
  });
});
