import { describe, it, expect } from "vitest";
import { parseKeypairInput } from "@/features/testnet-keypair-generator/schema";
import { validSeed } from "@/features/testnet-keypair-generator/fixtures/keypairGenerator.fixture";

describe("parseKeypairInput", () => {
  it("returns generate mode for empty input", () => {
    const result = parseKeypairInput("");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.mode).toBe("generate");
    }
  });

  it("returns derive mode for seed", () => {
    const result = parseKeypairInput(validSeed);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.mode).toBe("derive");
      expect(result.value.seed).toBe(validSeed);
    }
  });

  it("rejects invalid input", () => {
    const result = parseKeypairInput("X123");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("invalid_seed");
    }
  });
});
