import { describe, expect, it } from "vitest";
import { Keypair, StrKey } from "@stellar/stellar-sdk";
import {
  MAX_STRKEY_LENGTH,
  MIN_STRKEY_LENGTH,
  MUXED_STRKEY_LENGTH,
  STRKEY_ALPHABET,
  classifyPublicStrKey,
  isSearchableLength,
  isSecretSeedShaped,
  versionByteName
} from "@/features/strkey-corruption-locator/lib/strkey-alphabet";
import { validPublicKey, contractAddress, secretSeed } from "@/features/strkey-corruption-locator/fixtures/strkeyCorruptionLocator.fixture";

describe("STRKEY_ALPHABET", () => {
  it("matches the SEP-0023 base32 alphabet", () => {
    expect(STRKEY_ALPHABET).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567");
    expect(new Set(STRKEY_ALPHABET).size).toBe(32);
    expect(STRKEY_ALPHABET).not.toMatch(/[0189]/);
  });
});

describe("version bytes", () => {
  it("reads the SDK prefix table for public keys and secret seeds", () => {
    expect(versionByteName("G")).toBe("ed25519PublicKey");
    expect(versionByteName("S")).toBe("ed25519SecretSeed");
    expect(versionByteName("s")).toBe("ed25519SecretSeed");
    expect(versionByteName("M")).toBe("med25519PublicKey");
    expect(versionByteName("C")).toBe("contract");
    expect(versionByteName("Z")).toBeNull();
    expect(versionByteName("")).toBeNull();
  });

  it("treats only the secret-seed version byte as secret-shaped", () => {
    expect(isSecretSeedShaped(secretSeed)).toBe(true);
    expect(isSecretSeedShaped(`s${secretSeed.slice(1)}`)).toBe(true);
    expect(isSecretSeedShaped(validPublicKey)).toBe(false);
  });
});

describe("encoded lengths", () => {
  it("matches lengths produced by the SDK", () => {
    const account = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 1)).publicKey();
    const muxed = StrKey.encodeMed25519PublicKey(
      Buffer.concat([StrKey.decodeEd25519PublicKey(account), Buffer.alloc(8, 0)])
    );
    const payloadLength = 64;
    const body = Buffer.concat([Buffer.alloc(32, 1), Buffer.alloc(4), Buffer.alloc(payloadLength, 2)]);
    body.writeUInt32BE(payloadLength, 32);
    const signed = StrKey.encodeSignedPayload(body);

    expect(account).toHaveLength(MIN_STRKEY_LENGTH);
    expect(muxed).toHaveLength(MUXED_STRKEY_LENGTH);
    expect(signed).toHaveLength(MAX_STRKEY_LENGTH);
    expect(StrKey.isValidSignedPayload(signed)).toBe(true);
  });

  it("accepts only the SDK searchable window", () => {
    expect(isSearchableLength(MIN_STRKEY_LENGTH - 1)).toBe(false);
    expect(isSearchableLength(MIN_STRKEY_LENGTH)).toBe(true);
    expect(isSearchableLength(MUXED_STRKEY_LENGTH)).toBe(true);
    expect(isSearchableLength(MAX_STRKEY_LENGTH)).toBe(true);
    expect(isSearchableLength(MAX_STRKEY_LENGTH + 1)).toBe(false);
  });
});

describe("classifyPublicStrKey", () => {
  it("accepts a derived public key and contract, and skips secret seeds", () => {
    expect(classifyPublicStrKey(validPublicKey)).toBe("ed25519PublicKey");
    expect(classifyPublicStrKey(contractAddress)).toBe("contract");
    expect(classifyPublicStrKey(secretSeed)).toBeNull();
    expect(JSON.stringify(classifyPublicStrKey(secretSeed))).not.toContain(secretSeed);
  });
});
