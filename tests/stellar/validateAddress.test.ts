import { describe, expect, it } from "vitest";
import { Keypair, StrKey } from "@stellar/stellar-sdk";
import {
  validatePublicKey,
  validateContractId,
  getContractExplorerUrl
} from "../../lib/stellar/validateAddress";

describe("validatePublicKey", () => {
  it("accepts a valid Stellar public key", () => {
    const result = validatePublicKey(Keypair.random().publicKey());

    expect(result.valid).toBe(true);
    expect(result.message).toBe("This is a valid Stellar public address.");
  });

  it("rejects empty input", () => {
    const result = validatePublicKey("   ");

    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/Enter a Stellar public address/);
  });

  it("rejects secret-key prefixes before checksum validation", () => {
    const result = validatePublicKey("SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/start with G/);
  });

  it("rejects malformed G-address checksums", () => {
    const result = validatePublicKey("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/checksum or length/);
  });
});

describe("validateContractId", () => {
  /** Generate a valid contract ID using SDK's encodeContract. */
  function validContractId(): string {
    const buf = Buffer.alloc(32);
    for (let i = 0; i < 32; i++) buf[i] = i;
    return StrKey.encodeContract(buf);
  }

  it("accepts a valid Soroban contract ID", () => {
    const result = validateContractId(validContractId());

    expect(result.valid).toBe(true);
    expect(result.message).toMatch(/syntactically valid/);
    expect(result.checksumValid).toBe(true);
    expect(result.decodedHex).toBeDefined();
    // Decoded hex should be 64 hex characters (32 bytes)
    expect(result.decodedHex!.length).toBe(64);
  });

  it("rejects empty input", () => {
    const result = validateContractId("   ");

    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/Enter a Soroban contract/);
  });

  it("rejects classic account public keys (G...) with distinct message", () => {
    const result = validateContractId(Keypair.random().publicKey());

    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/classic account public key/);
    expect(result.message).toMatch(/start with C/);
  });

  it("rejects muxed account addresses (M...) with distinct message", () => {
    const result = validateContractId("MAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/muxed account/);
    expect(result.message).toMatch(/start with C/);
  });

  it("rejects secret seeds (S...) with distinct message", () => {
    const result = validateContractId("SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/secret seed/);
    expect(result.message).toMatch(/Never share/);
  });

  it("rejects malformed C-prefix values with bad checksum", () => {
    // 56 characters of C, which is too long/bad checksum
    const result = validateContractId("CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/does not match the Soroban contract ID format/);
  });

  it("rejects values starting with a random prefix", () => {
    const result = validateContractId("X12345678901234567890123456789012345678901234567890");

    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/does not match the Soroban contract ID format/);
  });
});

describe("getContractExplorerUrl", () => {
  const contractId = "CAAACAQDAQCQMBYIBEFAWDANBYHRAEISCMKBKFQXDAMRUGY4DUPB6N4O";

  it("returns testnet explorer URL", () => {
    const url = getContractExplorerUrl(contractId, "testnet");

    expect(url).toBe(
      `https://stellar.expert/explorer/testnet/contract/${contractId}`
    );
  });

  it("returns mainnet explorer URL", () => {
    const url = getContractExplorerUrl(contractId, "mainnet");

    expect(url).toBe(
      `https://stellar.expert/explorer/public/contract/${contractId}`
    );
  });

  it("returns null for unsupported networks", () => {
    const url = getContractExplorerUrl(contractId, "unknown");

    expect(url).toBeNull();
  });

  it("returns null for undefined network", () => {
    const url = getContractExplorerUrl(contractId, "");

    expect(url).toBeNull();
  });
});

