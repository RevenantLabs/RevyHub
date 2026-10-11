import { describe, it, expect } from "vitest";
import { parseHorizonUrlConfig } from "@/features/horizon-url-builder/schema";

describe("parseHorizonUrlConfig", () => {
  it("accepts valid config", () => {
    const result = parseHorizonUrlConfig({ resource: "accounts", network: "mainnet" });
    expect(result.ok).toBe(true);
  });

  it("rejects empty resource", () => {
    expect(parseHorizonUrlConfig({ resource: "", network: "mainnet" }).ok).toBe(false);
  });

  it("rejects invalid resource", () => {
    expect(parseHorizonUrlConfig({ resource: "invalid", network: "mainnet" }).ok).toBe(false);
  });

  it("rejects invalid network", () => {
    expect(parseHorizonUrlConfig({ resource: "accounts", network: "invalid" }).ok).toBe(false);
  });
});
