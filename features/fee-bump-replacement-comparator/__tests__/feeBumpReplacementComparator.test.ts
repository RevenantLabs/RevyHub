import { Networks } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";
import { compareFeeBumpReplacements } from "@/features/fee-bump-replacement-comparator/lib/feeBumpReplacementComparator";
import { parseFeeBumpReplacementComparatorInput } from "@/features/fee-bump-replacement-comparator/schema";
import {
  CUSTOM_PASSPHRASE,
  LARGE_TOTAL_FEE,
  OTHER_PASSPHRASE,
  PASSPHRASE,
  currentFeeBumpXdr,
  differentlySignedInnerXdr,
  feeSource,
  higherFeeBumpXdr,
  largeFeeBumpXdr,
  otherFeeSource,
  otherFeeSourceXdr
} from "@/features/fee-bump-replacement-comparator/fixtures/normal.fixture";
import {
  changedInnerSequenceXdr,
  changedInnerSourceXdr,
  lowerFeeBumpXdr,
  notAnEnvelopeXdr,
  ordinaryXdr,
  v0Xdr
} from "@/features/fee-bump-replacement-comparator/fixtures/boundary.fixture";

function compare(left: string, right: string, networkPassphrase: string = PASSPHRASE) {
  const parsed = parseFeeBumpReplacementComparatorInput({ left, right, networkPassphrase });
  if (!parsed.ok) throw new Error(`fixture failed to parse: ${parsed.code}`);
  return compareFeeBumpReplacements(parsed.value);
}

describe("compareFeeBumpReplacements", () => {
  it("accepts a higher-fee wrapper of the same inner as a replacement candidate", () => {
    const result = compare(currentFeeBumpXdr, higherFeeBumpXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.replacementCandidate).toBe(true);
    expect(result.value.innerIdentity.equivalent).toBe(true);
    expect(result.value.innerIdentity.hashesMatch).toBe(true);
    expect(result.value.innerIdentity.payloadsMatch).toBe(true);
    expect(result.value.outerFee.feeIncreased).toBe(true);
    expect(result.value.left.outerFee).toBe("600");
    expect(result.value.right.outerFee).toBe("900");
  });

  it("keeps equal inners equivalent when only inner signatures differ", () => {
    const result = compare(currentFeeBumpXdr, differentlySignedInnerXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.innerIdentity.equivalent).toBe(true);
    expect(result.value.left.innerSignatureCount).toBe(1);
    expect(result.value.right.innerSignatureCount).toBe(1);
    expect(result.value.left.innerHash).toBe(result.value.right.innerHash);
  });

  it("refuses equivalence when the inner source changes", () => {
    const result = compare(currentFeeBumpXdr, changedInnerSourceXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.replacementCandidate).toBe(false);
    expect(result.value.innerIdentity.equivalent).toBe(false);
    expect(result.value.innerIdentity.hashesMatch).toBe(false);
    expect(result.value.innerIdentity.payloadsMatch).toBe(false);
  });

  it("refuses equivalence when the inner sequence changes", () => {
    const result = compare(currentFeeBumpXdr, changedInnerSequenceXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.replacementCandidate).toBe(false);
    expect(result.value.innerIdentity.reason).toBe("hash_and_payload_mismatch");
  });

  it("reports a lower outer fee without claiming mempool acceptance", () => {
    const result = compare(currentFeeBumpXdr, lowerFeeBumpXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.replacementCandidate).toBe(true);
    expect(result.value.outerFee.feeDecreased).toBe(true);
    expect(result.value.outerFee.rightOuterFee).toBe("300");
    expect(result.value.outerFee.feeDelta).toBe("-300");
  });

  it("shows fee-source accounts and signature counts on both sides", () => {
    const result = compare(currentFeeBumpXdr, otherFeeSourceXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.left.feeSource).toBe(feeSource.publicKey());
    expect(result.value.right.feeSource).toBe(otherFeeSource.publicKey());
    expect(result.value.outerFee.sameFeeSource).toBe(false);
    expect(result.value.left.outerSignatureCount).toBe(1);
    expect(result.value.right.outerSignatureCount).toBe(1);
    expect(result.value.left.innerOperationCount).toBe(2);
  });

  it("derives different inner hashes under a different network passphrase", () => {
    const testnet = compare(currentFeeBumpXdr, higherFeeBumpXdr, Networks.TESTNET);
    const publicNet = compare(currentFeeBumpXdr, higherFeeBumpXdr, OTHER_PASSPHRASE);
    const custom = compare(currentFeeBumpXdr, higherFeeBumpXdr, CUSTOM_PASSPHRASE);

    expect(testnet.ok && publicNet.ok && custom.ok).toBe(true);
    if (!testnet.ok || !publicNet.ok || !custom.ok) return;

    expect(publicNet.value.left.innerHash).not.toBe(testnet.value.left.innerHash);
    expect(custom.value.left.innerHash).not.toBe(testnet.value.left.innerHash);
    // Same pair under one passphrase still matches itself.
    expect(publicNet.value.innerIdentity.equivalent).toBe(true);
  });

  it("carries a fee past Number.MAX_SAFE_INTEGER without losing stroops", () => {
    const result = compare(currentFeeBumpXdr, largeFeeBumpXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(Number(LARGE_TOTAL_FEE)).toBeGreaterThan(Number.MAX_SAFE_INTEGER);
    expect(result.value.right.outerFee).toBe(LARGE_TOTAL_FEE);
    expect(result.value.outerFee.feeIncreased).toBe(true);
  });

  it("reports an ordinary v1 envelope as unsupported rather than malformed", () => {
    expect(compare(currentFeeBumpXdr, ordinaryXdr)).toEqual({
      ok: false,
      code: "unsupported_variant",
      detail: "right"
    });
  });

  it("reports a v0 envelope as unsupported rather than malformed", () => {
    expect(compare(v0Xdr, higherFeeBumpXdr)).toEqual({
      ok: false,
      code: "unsupported_variant",
      detail: "left"
    });
  });

  it("rejects valid base64 that is not a transaction envelope", () => {
    expect(compare(currentFeeBumpXdr, notAnEnvelopeXdr)).toEqual({
      ok: false,
      code: "malformed_data",
      detail: "right"
    });
  });

  it("records the passphrase it actually used", () => {
    const result = compare(currentFeeBumpXdr, higherFeeBumpXdr, CUSTOM_PASSPHRASE);
    expect(result.ok && result.value.networkPassphrase).toBe(CUSTOM_PASSPHRASE);
  });
});
