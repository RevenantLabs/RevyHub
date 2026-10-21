import { describe, expect, it } from "vitest";
import { Networks, TransactionBuilder, xdr } from "@stellar/stellar-sdk";
import { networkId } from "@/features/signing-payload-inspector/lib/network-id";
import { signatureBase, v0SigningTransaction } from "@/features/signing-payload-inspector/lib/signature-base";
import { classicXdr, classicV0Xdr } from "@/features/signing-payload-inspector/fixtures/classic-envelope.fixture";
import { feeBumpXdr } from "@/features/signing-payload-inspector/fixtures/fee-bump-envelope.fixture";

describe("signatureBase", () => {
  const id = networkId("testnet");
  it("matches the SDK for a classic v1 envelope, including tag 2", () => {
    const tx = xdr.TransactionEnvelope.fromXDR(classicXdr, "base64").v1().tx();
    const bytes = signatureBase(id, "classic", tx);
    expect(bytes.subarray(0, 32)).toEqual(id);
    expect(bytes.readUInt32BE(32)).toBe(2);
    expect(bytes).toEqual(TransactionBuilder.fromXDR(classicXdr, Networks.TESTNET).signatureBase());
  });
  it("converts classic v0 to the protocol's v1-tagged signing transaction", () => {
    const tx = xdr.TransactionEnvelope.fromXDR(classicV0Xdr, "base64").v0().tx();
    const bytes = signatureBase(id, "classic", v0SigningTransaction(tx));
    expect(bytes.readUInt32BE(32)).toBe(2);
    expect(bytes).toEqual(TransactionBuilder.fromXDR(classicV0Xdr, Networks.TESTNET).signatureBase());
  });
  it("matches the SDK fee-bump signature base with tag 5", () => {
    const tx = xdr.TransactionEnvelope.fromXDR(feeBumpXdr, "base64").feeBump().tx();
    const bytes = signatureBase(id, "fee-bump", tx);
    expect(bytes.readUInt32BE(32)).toBe(5);
    expect(bytes).toEqual(TransactionBuilder.fromXDR(feeBumpXdr, Networks.TESTNET).signatureBase());
  });
});
