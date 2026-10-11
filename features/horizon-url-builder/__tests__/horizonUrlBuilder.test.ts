import { describe, it, expect } from "vitest";
import { buildHorizonUrl, getValidResources, getHorizonUrl } from "@/features/horizon-url-builder/lib/horizonUrlBuilder";

describe("buildHorizonUrl", () => {
  it("builds basic URL", () => {
    const result = buildHorizonUrl({ resource: "accounts", network: "mainnet" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.url).toContain("horizon.stellar.org/accounts");
    }
  });

  it("builds testnet URL", () => {
    const result = buildHorizonUrl({ resource: "transactions", network: "testnet" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.url).toContain("horizon-testnet.stellar.org");
    }
  });

  it("includes cursor parameter", () => {
    const result = buildHorizonUrl({ resource: "accounts", network: "mainnet", cursor: "abc123" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.url).toContain("cursor=abc123");
    }
  });

  it("includes limit parameter", () => {
    const result = buildHorizonUrl({ resource: "offers", network: "mainnet", limit: 50 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.url).toContain("limit=50");
    }
  });

  it("clamps limit to 200", () => {
    const result = buildHorizonUrl({ resource: "trades", network: "mainnet", limit: 500 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.url).toContain("limit=200");
    }
  });

  it("includes order parameter", () => {
    const result = buildHorizonUrl({ resource: "payments", network: "mainnet", order: "desc" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.url).toContain("order=desc");
    }
  });

  it("rejects empty resource", () => {
    const result = buildHorizonUrl({ resource: "" as any, network: "mainnet" });
    expect(result.ok).toBe(false);
  });

  it("rejects invalid resource", () => {
    const result = buildHorizonUrl({ resource: "invalid" as any, network: "mainnet" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("invalid_resource");
  });

  it("rejects invalid network", () => {
    const result = buildHorizonUrl({ resource: "accounts", network: "invalid" as any });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("invalid_network");
  });
});

describe("getValidResources", () => {
  it("returns all resources", () => {
    const resources = getValidResources();
    expect(resources.length).toBe(9);
    expect(resources).toContain("accounts");
    expect(resources).toContain("transactions");
  });
});

describe("getHorizonUrl", () => {
  it("returns mainnet URL", () => {
    expect(getHorizonUrl("mainnet")).toBe("https://horizon.stellar.org");
  });
  it("returns testnet URL", () => {
    expect(getHorizonUrl("testnet")).toBe("https://horizon-testnet.stellar.org");
  });
});
