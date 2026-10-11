import { describe, it, expect } from "vitest";
import {
  generateTestnetKeypair,
  deriveFromSeed,
  validateKeypairInput,
  getTestnetPassphrase,
  getMainnetPassphrase,
} from "@/features/testnet-keypair-generator/lib/keypairGenerator";
import { validPublicKey, validSeed } from "@/features/testnet-keypair-generator/fixtures/keypairGenerator.fixture";

describe("generateTestnetKeypair", () => {
  it("generates a valid keypair", () => {
    const kp = generateTestnetKeypair();
    expect(kp.publicKey.startsWith("G")).toBe(true);
    expect(kp.seed.startsWith("S")).toBe(true);
    expect(kp.network).toBe("testnet");
  });

  it("generates unique keypairs", () => {
    const kp1 = generateTestnetKeypair();
    const kp2 = generateTestnetKeypair();
    expect(kp1.publicKey).not.toBe(kp2.publicKey);
    expect(kp1.seed).not.toBe(kp2.seed);
  });
});

describe("deriveFromSeed", () => {
  it("derives correct public key from seed", () => {
    const result = deriveFromSeed(validSeed);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.publicKey).toBe(validPublicKey);
    }
  });

  it("rejects invalid seed", () => {
    const result = deriveFromSeed("SINVALID");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("invalid_seed");
    }
  });

  it("rejects empty seed", () => {
    const result = deriveFromSeed("");
    expect(result.ok).toBe(false);
  });
});

describe("validateKeypairInput", () => {
  it("validates public key", () => {
    const result = validateKeypairInput(validPublicKey);
    expect(result.valid).toBe(true);
    expect(result.type).toBe("public");
  });

  it("validates seed", () => {
    const result = validateKeypairInput(validSeed);
    expect(result.valid).toBe(true);
    expect(result.type).toBe("seed");
  });

  it("rejects invalid input", () => {
    expect(validateKeypairInput("").valid).toBe(false);
    expect(validateKeypairInput("invalid").valid).toBe(false);
  });
});

describe("network passphrases", () => {
  it("returns testnet passphrase", () => {
    expect(getTestnetPassphrase()).toBe("Test SDF Network ; September 2015");
  });

  it("returns mainnet passphrase", () => {
    expect(getMainnetPassphrase()).toBe("Public Global Stellar Network ; September 2015");
  });
});
