import { describe, expect, it } from "vitest";
import { Keypair, StrKey } from "@stellar/stellar-sdk";
import { validateContractId } from "../../lib/stellar/validateContractId";

describe("validateContractId", () => {
  it("accepts a valid Soroban contract ID", () => {
    const buf = Buffer.alloc(32, 0xca);
    const contractId = StrKey.encodeContract(buf);
    const result = validateContractId(contractId);

    expect(result.valid).toBe(true);
    expect(result.type).toBe("contract");
    expect(result.checksumValid).toBe(true);
    expect(result.decodedPayload).toBe(buf.toString("hex"));
  });

  it("rejects empty input", () => {
    const result = validateContractId("   ");

    expect(result.valid).toBe(false);
    expect(result.type).toBe("empty");
    expect(result.message).toMatch(/Enter a Soroban contract ID/);
  });

  it("rejects classic account addresses (G-prefix)", () => {
    const result = validateContractId(Keypair.random().publicKey());

    expect(result.valid).toBe(false);
    expect(result.type).toBe("publicKey");
    expect(result.message).toMatch(/starts with G/);
  });

  it("rejects muxed account addresses (M-prefix)", () => {
    const result = validateContractId("MAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7G37");

    expect(result.valid).toBe(false);
    expect(result.type).toBe("muxedAccount");
    expect(result.message).toMatch(/starts with M/);
  });

  it("rejects secret seeds (S-prefix)", () => {
    const result = validateContractId(Keypair.random().secret());

    expect(result.valid).toBe(false);
    expect(result.type).toBe("secretSeed");
    expect(result.message).toMatch(/starts with S/);
  });

  it("rejects malformed C-prefix value with bad checksum", () => {
    const result = validateContractId("CA3D5K7F7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7J7A");

    expect(result.valid).toBe(false);
    expect(result.type).toBe("malformed");
    expect(result.message).toMatch(/checksum or length/);
  });

  it("rejects unknown prefix", () => {
    const result = validateContractId("XAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

    expect(result.valid).toBe(false);
    expect(result.type).toBe("malformed");
    expect(result.message).toMatch(/starts with "X"/);
  });

  it("rejects too-short input", () => {
    const result = validateContractId("C");

    expect(result.valid).toBe(false);
    expect(result.type).toBe("malformed");
    expect(result.message).toMatch(/too short/);
  });

  it("decodes contract ID payload to hex", () => {
    const buf = Buffer.alloc(32, 0xab);
    const contractId = StrKey.encodeContract(buf);
    const result = validateContractId(contractId);

    expect(result.valid).toBe(true);
    expect(result.decodedPayload).toBe(buf.toString("hex"));
  });

  it("reports checksum as valid", () => {
    const buf = Buffer.alloc(32, 0x01);
    const contractId = StrKey.encodeContract(buf);
    const result = validateContractId(contractId);

    expect(result.valid).toBe(true);
    expect(result.checksumValid).toBe(true);
  });
});
