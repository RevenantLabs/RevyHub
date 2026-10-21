import { describe, expect, it } from "vitest";
import { FeeBumpTransaction, Networks, Transaction, TransactionBuilder } from "@stellar/stellar-sdk";
import { runSigningPayloadInspector as run } from "@/features/signing-payload-inspector/lib/signingPayloadInspector";
import { MAX_XDR_LENGTH } from "@/features/signing-payload-inspector/schema";
import { signingPayloadFixtures as fixture } from "@/features/signing-payload-inspector/fixtures/signingPayloadInspector.fixture";
import { feeSource } from "@/features/signing-payload-inspector/fixtures/fee-bump-envelope.fixture";

describe("runSigningPayloadInspector", () => {
  it("returns the exact classic v1 signature base and hash", () => {
    const result = run(fixture.classicXdr, "testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const sdk = TransactionBuilder.fromXDR(fixture.classicXdr, Networks.TESTNET);
    expect(result.value.variant).toBe("classic-v1");
    expect(result.value.outer.signatureBaseHex).toBe(sdk.signatureBase().toString("hex"));
    expect(result.value.outer.payloadHashHex).toBe(sdk.hash().toString("hex"));
    expect(result.value.inner).toBeNull();
    expect(result.value.outer.signatureBaseHex.startsWith(result.value.networkIdHex)).toBe(true);
  });
  it("supports the classic v0 compatibility payload", () => {
    const result = run(fixture.classicV0Xdr, "testnet");
    expect(result.ok && result.value.variant).toBe("classic-v0");
  });
  it("shows distinct outer and inner fee-bump payloads matching the SDK", () => {
    const result = run(fixture.feeBumpXdr, "testnet");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const sdk = TransactionBuilder.fromXDR(fixture.feeBumpXdr, Networks.TESTNET);
    expect(sdk).toBeInstanceOf(FeeBumpTransaction);
    if (!(sdk instanceof FeeBumpTransaction)) return;
    expect(result.value.variant).toBe("fee-bump");
    expect(result.value.outer.signatureBaseHex).toBe(sdk.signatureBase().toString("hex"));
    expect(result.value.outer.payloadHashHex).toBe(sdk.hash().toString("hex"));
    expect(result.value.inner?.signatureBaseHex).toBe(sdk.innerTransaction.signatureBase().toString("hex"));
    expect(result.value.inner?.payloadHashHex).toBe(sdk.innerTransaction.hash().toString("hex"));
    expect(result.value.outer.payloadHashHex).not.toBe(result.value.inner?.payloadHashHex);
  });
  it("changes network ID and both hashes when the passphrase changes", () => {
    const testnet = run(fixture.feeBumpXdr, "testnet");
    const mainnet = run(fixture.feeBumpXdr, "mainnet");
    expect(testnet.ok && mainnet.ok).toBe(true);
    if (!testnet.ok || !mainnet.ok) return;
    expect(mainnet.value.networkIdHex).not.toBe(testnet.value.networkIdHex);
    expect(mainnet.value.outer.payloadHashHex).not.toBe(testnet.value.outer.payloadHashHex);
    expect(mainnet.value.inner?.payloadHashHex).not.toBe(testnet.value.inner?.payloadHashHex);
  });
  it("includes inner decorated signatures in the outer payload only", () => {
    const signedInner = run(fixture.feeBumpXdr, "testnet");
    const unsignedInner = TransactionBuilder.fromXDR(fixture.classicXdr, Networks.TESTNET) as Transaction;
    const unsignedBump = TransactionBuilder.buildFeeBumpTransaction(
      feeSource, "200", unsignedInner, Networks.TESTNET
    );
    const unsignedResult = run(unsignedBump.toXDR(), "testnet");
    expect(signedInner.ok && unsignedResult.ok).toBe(true);
    if (!signedInner.ok || !unsignedResult.ok) return;
    expect(signedInner.value.outer.payloadHashHex).not.toBe(unsignedResult.value.outer.payloadHashHex);
    expect(signedInner.value.inner?.payloadHashHex).toBe(unsignedResult.value.inner?.payloadHashHex);
  });
  it("returns actionable error codes for empty, malformed, unsupported, and oversized input", () => {
    expect(run("", "testnet")).toEqual({ ok: false, code: "empty_xdr" });
    expect(run(fixture.invalidBase64, "testnet")).toEqual({ ok: false, code: "invalid_xdr" });
    expect(run(fixture.nonEnvelopeBase64, "testnet")).toEqual({ ok: false, code: "invalid_xdr" });
    expect(run(fixture.classicXdr.slice(0, -4), "testnet")).toEqual({ ok: false, code: "invalid_xdr" });
    expect(run(Buffer.concat([Buffer.from(fixture.classicXdr, "base64"), Buffer.from([0])]).toString("base64"), "testnet"))
      .toEqual({ ok: false, code: "invalid_xdr" });
    expect(run(Buffer.from([0, 0, 0, 1]).toString("base64"), "testnet")).toEqual({ ok: false, code: "unsupported_envelope" });
    expect(run("A".repeat(MAX_XDR_LENGTH + 4), "testnet")).toEqual({ ok: false, code: "too_large" });
  });
});
