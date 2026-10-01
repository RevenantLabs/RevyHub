import { describe, expect, it } from "vitest";
import { parseTestnetKeypairGeneratorInput } from "@/features/testnet-keypair-generator/schema";

describe("parseTestnetKeypairGeneratorInput", () => {
  it("accepts valid label and sets defaults", () => {
    const result = parseTestnetKeypairGeneratorInput("  Testing Wallet  ");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.label).toBe("Testing Wallet");
      expect(result.value.checkNetwork).toBe(true);
    }
  });

  it("handles empty label gracefully", () => {
    const result = parseTestnetKeypairGeneratorInput("   ");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.label).toBeUndefined();
      expect(result.value.checkNetwork).toBe(true);
    }
  });

  it("respects checkNetwork flag", () => {
    const result = parseTestnetKeypairGeneratorInput("Alice", false);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.checkNetwork).toBe(false);
    }
  });

  it("strictly rejects secret seed inputs starting with S", () => {
    const testSecret = "SBZ2O7LMWTY3X3T32SZZK52F4E7U6W23EOGQOES52Z5H7R774H7NVRN2";
    const result = parseTestnetKeypairGeneratorInput(testSecret);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("secret_input_prohibited");
    }
  });

  it("rejects lowercase secret inputs", () => {
    const result = parseTestnetKeypairGeneratorInput("srandomsecretkeytest");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("secret_input_prohibited");
    }
  });

  it("rejects labels exceeding maximum length", () => {
    const longLabel = "a".repeat(51);
    const result = parseTestnetKeypairGeneratorInput(longLabel);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("label_too_long");
    }
  });
});
