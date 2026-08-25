import { describe, expect, it } from "vitest";
import { detectKind, validateAddress } from "@/features/address-validator/lib/addressValidator";
import {
  contractAddress,
  mistypedPublicKey,
  muxedAddress,
  secretSeed,
  truncatedPublicKey,
  unknownPrefix,
  validPublicKey
} from "@/features/address-validator/fixtures/addressValidator.fixture";

describe("detectKind", () => {
  it.each([
    [validPublicKey, "ed25519_public_key"],
    [muxedAddress, "muxed_account"],
    [contractAddress, "contract"],
    [secretSeed, "ed25519_secret_seed"],
    [unknownPrefix, "unknown"]
  ])("classifies %s by prefix", (address, expected) => {
    expect(detectKind(address)).toBe(expected);
  });

  it("treats an empty string as unknown", () => {
    expect(detectKind("")).toBe("unknown");
  });
});

describe("validateAddress", () => {
  it("accepts a well-formed Ed25519 public key", () => {
    const result = validateAddress({ address: validPublicKey });

    expect(result.valid).toBe(true);
    expect(result.code).toBe("valid");
    expect(result.kind).toBe("ed25519_public_key");
    expect(result.address).toBe(validPublicKey);
    expect(result.length).toBe(56);
  });

  it("rejects a secret seed without echoing it back", () => {
    const result = validateAddress({ address: secretSeed });

    expect(result.valid).toBe(false);
    expect(result.code).toBe("secret_seed_rejected");
    expect(result.address).toBe("");
    expect(JSON.stringify(result)).not.toContain(secretSeed);
  });

  it("reports a truncated public key as a checksum or length failure", () => {
    const result = validateAddress({ address: truncatedPublicKey });

    expect(result.valid).toBe(false);
    expect(result.code).toBe("bad_checksum_or_length");
  });

  it("reports a single mistyped character as a checksum failure", () => {
    const result = validateAddress({ address: mistypedPublicKey });

    expect(result.valid).toBe(false);
    expect(result.code).toBe("bad_checksum_or_length");
  });

  it("separates an unrecognised prefix from a checksum failure", () => {
    const result = validateAddress({ address: unknownPrefix });

    expect(result.code).toBe("unknown_prefix");
    expect(result.kind).toBe("unknown");
  });

  it("recognises a well-formed contract address as an unsupported kind", () => {
    const result = validateAddress({ address: contractAddress });

    expect(result.valid).toBe(false);
    expect(result.code).toBe("unsupported_kind");
    expect(result.kind).toBe("contract");
  });

  it("recognises a well-formed muxed account as an unsupported kind", () => {
    const result = validateAddress({ address: muxedAddress });

    expect(result.code).toBe("unsupported_kind");
    expect(result.kind).toBe("muxed_account");
  });
});
