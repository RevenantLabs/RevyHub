import { describe, it, expect } from "vitest";
import { truncateAddress, maskSeed } from "@/features/testnet-keypair-generator/lib/format";

describe("truncateAddress", () => {
  it("truncates long addresses", () => {
    const long = "G".repeat(60);
    expect(truncateAddress(long)).toContain("...");
  });

  it("keeps short addresses as-is", () => {
    expect(truncateAddress("GABC123")).toBe("GABC123");
  });
});

describe("maskSeed", () => {
  it("masks seed", () => {
    const masked = maskSeed("SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    expect(masked).toContain("*");
  });

  it("returns **** for short seeds", () => {
    expect(maskSeed("SHORT")).toBe("****");
  });
});
