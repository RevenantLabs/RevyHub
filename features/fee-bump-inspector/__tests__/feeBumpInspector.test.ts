import { Networks } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";
import { inspectFeeBump } from "@/features/fee-bump-inspector/lib/feeBumpInspector";
import { parseFeeBumpInput } from "@/features/fee-bump-inspector/schema";
import {
  CUSTOM_PASSPHRASE,
  LARGE_TOTAL_FEE,
  MUXED_ID,
  OTHER_PASSPHRASE,
  feeBumpXdr,
  feeSource,
  innerSource,
  largeFeeBumpXdr,
  muxedFeeBumpXdr,
  muxedFeeSourceAddress,
  notAnEnvelopeXdr,
  ordinaryXdr,
  unsignedFeeBumpXdr,
  v0Xdr
} from "@/features/fee-bump-inspector/fixtures/feeBumpInspector.fixture";

function inspect(envelope: string, networkPassphrase: string = Networks.TESTNET) {
  const parsed = parseFeeBumpInput({ envelope, networkPassphrase });
  if (!parsed.ok) throw new Error(`fixture failed to parse: ${parsed.code}`);
  return inspectFeeBump(parsed.value);
}

describe("inspectFeeBump", () => {
  it("separates the fee source from the inner source", () => {
    const result = inspect(feeBumpXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.outer.feeSource.address).toBe(feeSource.publicKey());
    expect(result.value.inner.source.address).toBe(innerSource.publicKey());
  });

  it("reports the inner sequence, fee and operations, not the wrapper's", () => {
    const result = inspect(feeBumpXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.inner.sequence).toBe("4370426197114881");
    expect(result.value.inner.fee).toBe("200");
    expect(result.value.inner.operationTypes).toEqual(["payment", "bumpSequence"]);
    expect(result.value.inner.operationCount).toBe(2);
  });

  it("produces two different hashes for the two layers", () => {
    const result = inspect(feeBumpXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.outer.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(result.value.inner.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(result.value.outer.hash).not.toBe(result.value.inner.hash);
  });

  it("derives different hashes under a different network passphrase", () => {
    const testnet = inspect(feeBumpXdr, Networks.TESTNET);
    const publicNet = inspect(feeBumpXdr, OTHER_PASSPHRASE);
    const custom = inspect(feeBumpXdr, CUSTOM_PASSPHRASE);

    expect(testnet.ok && publicNet.ok && custom.ok).toBe(true);
    if (!testnet.ok || !publicNet.ok || !custom.ok) return;

    expect(publicNet.value.outer.hash).not.toBe(testnet.value.outer.hash);
    expect(custom.value.inner.hash).not.toBe(testnet.value.inner.hash);
  });

  it("keeps the inner hash independent of which layer is signed", () => {
    const signed = inspect(feeBumpXdr);
    const unsigned = inspect(unsignedFeeBumpXdr);

    expect(signed.ok && unsigned.ok).toBe(true);
    if (!signed.ok || !unsigned.ok) return;
    // The inner transaction differs only by its signatures, which are not
    // part of the signature base — so the inner hash must be identical.
    expect(unsigned.value.inner.hash).toBe(signed.value.inner.hash);
  });

  it("counts signatures per layer and reports their hints", () => {
    const result = inspect(feeBumpXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.outer.signatures.count).toBe(1);
    expect(result.value.inner.signatures.count).toBe(1);
    expect(result.value.outer.signatures.hints[0]).toMatch(/^[0-9a-f]{8}$/);
    expect(result.value.outer.signatures.hints).not.toEqual(result.value.inner.signatures.hints);
  });

  it("handles empty signature vectors on both layers", () => {
    const result = inspect(unsignedFeeBumpXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.outer.signatures).toEqual({ count: 0, hints: [] });
    expect(result.value.inner.signatures).toEqual({ count: 0, hints: [] });
  });

  it("preserves muxed addresses and reports the underlying account beside them", () => {
    const result = inspect(muxedFeeBumpXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.outer.feeSource.address).toBe(muxedFeeSourceAddress);
    expect(result.value.outer.feeSource.baseAddress).toBe(feeSource.publicKey());
    expect(result.value.outer.feeSource.muxedId).toBe(MUXED_ID);
    expect(result.value.inner.source.baseAddress).toBe(innerSource.publicKey());
  });

  it("carries a fee past Number.MAX_SAFE_INTEGER without losing stroops", () => {
    const result = inspect(largeFeeBumpXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(Number(LARGE_TOTAL_FEE)).toBeGreaterThan(Number.MAX_SAFE_INTEGER);
    expect(result.value.outer.maxFee).toBe(LARGE_TOTAL_FEE);
    expect(result.value.feeBid.maxFeePerOperation).toBe("4000000000000000");
  });

  it("charges the fee bid across the inner operations plus the wrapper", () => {
    const result = inspect(feeBumpXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.feeBid.chargeableOperations).toBe(3);
    expect(result.value.feeBid.maxFee).toBe("600");
    expect(result.value.feeBid.maxFeePerOperation).toBe("200");
    expect(result.value.feeBid.innerFee).toBe("200");
  });

  it("reports an ordinary v1 envelope as not a fee bump", () => {
    expect(inspect(ordinaryXdr)).toEqual({ ok: false, code: "not_fee_bump" });
  });

  it("reports a v0 envelope as not a fee bump rather than as malformed", () => {
    expect(inspect(v0Xdr)).toEqual({ ok: false, code: "not_fee_bump" });
  });

  it("rejects valid base64 that is not a transaction envelope", () => {
    expect(inspect(notAnEnvelopeXdr)).toEqual({ ok: false, code: "invalid_xdr" });
  });

  it("records the passphrase it actually used", () => {
    const result = inspect(feeBumpXdr, CUSTOM_PASSPHRASE);
    expect(result.ok && result.value.networkPassphrase).toBe(CUSTOM_PASSPHRASE);
  });
});
