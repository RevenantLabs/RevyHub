import { describe, it, expect } from "vitest";
import { parseNetworkSearchInput } from "@/features/network-passphrase-inspector/schema";

describe("parseNetworkSearchInput", () => {
  it("accepts empty query", () => {
    const result = parseNetworkSearchInput("");
    expect(result.ok).toBe(true);
  });

  it("accepts valid query", () => {
    const result = parseNetworkSearchInput("mainnet");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.query).toBe("mainnet");
    }
  });

  it("accepts valid type", () => {
    const result = parseNetworkSearchInput("", "testnet");
    expect(result.ok).toBe(true);
  });

  it("rejects invalid type", () => {
    const result = parseNetworkSearchInput("", "invalid");
    expect(result.ok).toBe(false);
  });

  it("trims whitespace", () => {
    const result = parseNetworkSearchInput("  mainnet  ");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.query).toBe("mainnet");
    }
  });
});
