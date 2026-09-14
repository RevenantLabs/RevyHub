import { describe, it, expect } from "vitest";
import { formatNetworkType, truncateUrl } from "@/features/network-passphrase-inspector/lib/format";

describe("formatNetworkType", () => {
  it("formats mainnet", () => expect(formatNetworkType("mainnet")).toBe("Mainnet"));
  it("formats testnet", () => expect(formatNetworkType("testnet")).toBe("Testnet"));
  it("handles unknown", () => expect(formatNetworkType("unknown")).toBe("unknown"));
});

describe("truncateUrl", () => {
  it("truncates long URLs", () => expect(truncateUrl("https://example.com/very/long/path", 20)).toContain("..."));
  it("keeps short URLs", () => expect(truncateUrl("https://a.co", 20)).toBe("https://a.co"));
});
