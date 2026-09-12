import { describe, expect, it } from "vitest";
import { isErr, isOk } from "@/core/result/result";
import { inspectStrkey } from "@/features/strkey-inspector/lib/strkeyInspector";
import {
  contractAddress,
  mistypedPublicKey,
  muxedAddress,
  preAuthTxAddress,
  secretSeed,
  sha256HashAddress,
  signedPayloadAddress,
  truncatedPublicKey,
  unknownPrefix,
  validPublicKey
} from "@/features/strkey-inspector/fixtures/strkeyInspector.fixture";

describe("inspectStrkey", () => {
  it("decodes a standard Ed25519 public key (G)", () => {
    const result = inspectStrkey({ value: validPublicKey });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.kind).toBe("ed25519_public_key");
      expect(result.value.prefix).toBe("G");
      expect(result.value.strkey).toBe(validPublicKey);
      expect(result.value.byteLength).toBe(32);
      expect(result.value.rawBytesHex).toHaveLength(64);
    }
  });

  it("decodes a muxed account (M) and extracts base G address and muxed ID", () => {
    const result = inspectStrkey({ value: muxedAddress });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.kind).toBe("muxed_account");
      expect(result.value.prefix).toBe("M");
      expect(result.value.strkey).toBe(muxedAddress);
      expect(result.value.byteLength).toBe(40);
      expect(result.value.muxedGAddress).toBe(validPublicKey);
      expect(result.value.muxedId).toBe("42");
    }
  });

  it("decodes a contract address (C)", () => {
    const result = inspectStrkey({ value: contractAddress });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.kind).toBe("contract");
      expect(result.value.prefix).toBe("C");
      expect(result.value.byteLength).toBe(32);
      expect(result.value.rawBytesHex).toHaveLength(64);
    }
  });

  it("decodes a pre-authorized transaction hash (T)", () => {
    const result = inspectStrkey({ value: preAuthTxAddress });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.kind).toBe("pre_auth_tx");
      expect(result.value.prefix).toBe("T");
      expect(result.value.byteLength).toBe(32);
      expect(result.value.rawBytesHex).toHaveLength(64);
    }
  });

  it("decodes a SHA-256 hash signer (X)", () => {
    const result = inspectStrkey({ value: sha256HashAddress });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.kind).toBe("sha256_hash");
      expect(result.value.prefix).toBe("X");
      expect(result.value.byteLength).toBe(32);
      expect(result.value.rawBytesHex).toHaveLength(64);
    }
  });

  it("decodes a signed payload signer (P)", () => {
    const result = inspectStrkey({ value: signedPayloadAddress });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.kind).toBe("signed_payload");
      expect(result.value.prefix).toBe("P");
      expect(result.value.byteLength).toBe(40);
      expect(result.value.rawBytesHex).toHaveLength(80);
    }
  });

  it("strictly rejects a secret seed without decoding or echoing it back", () => {
    const result = inspectStrkey({ value: secretSeed });
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.code).toBe("secret_seed_rejected");
      expect(JSON.stringify(result)).not.toContain(secretSeed);
    }
  });

  it("returns unknown_prefix for unrecognised version byte", () => {
    const result = inspectStrkey({ value: unknownPrefix });
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.code).toBe("unknown_prefix");
    }
  });

  it("reports truncated public key as bad_checksum", () => {
    const result = inspectStrkey({ value: truncatedPublicKey });
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.code).toBe("bad_checksum");
    }
  });

  it("reports mistyped character as bad_checksum", () => {
    const result = inspectStrkey({ value: mistypedPublicKey });
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.code).toBe("bad_checksum");
    }
  });

  it("returns empty_input for empty string", () => {
    const result = inspectStrkey({ value: "" });
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.code).toBe("empty_input");
    }
  });
});
