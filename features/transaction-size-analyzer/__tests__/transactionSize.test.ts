import { describe, expect, it } from "vitest";
import { analyzeSize, assessBudget, XDR_WORD } from "@/features/transaction-size-analyzer/lib/transactionSize";
import { parseSizeInput } from "@/features/transaction-size-analyzer/schema";
import type { LayerBreakdown } from "@/features/transaction-size-analyzer/types";
import {
  feeBumpXdr,
  longMemoXdr,
  notAnEnvelopeXdr,
  shortMemoXdr,
  signedXdr,
  singleOperationXdr,
  twiceSignedXdr,
  twoOperationXdr,
  unsignedFeeBumpXdr,
  v0Xdr
} from "@/features/transaction-size-analyzer/fixtures/transactionSize.fixture";

function analyze(envelope: string, budget = "") {
  const parsed = parseSizeInput({ envelope, budget });
  if (!parsed.ok) throw new Error(`fixture failed to parse: ${parsed.code}`);
  return analyzeSize(parsed.value);
}

function sectionsOf(layer: LayerBreakdown) {
  return Object.fromEntries(layer.sections.map((section) => [section.key, section.bytes]));
}

function sumOf(layer: LayerBreakdown) {
  return layer.sections.reduce((total, section) => total + section.bytes, 0);
}

describe("analyzeSize", () => {
  it("reports XDR bytes, not base64 characters", () => {
    const result = analyze(twoOperationXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const actualBytes = Buffer.from(twoOperationXdr, "base64").length;
    expect(result.value.totalBytes).toBe(actualBytes);
    // Three bytes become four characters, so base64 is always longer.
    expect(result.value.normalizedBase64Length).toBeGreaterThan(result.value.totalBytes);
    expect(result.value.normalizedBase64Length).toBe(twoOperationXdr.length);
  });

  it("keeps the pasted length separate from the normalized length", () => {
    const wrapped = `${twoOperationXdr.slice(0, 20)}\n  ${twoOperationXdr.slice(20)}`;
    const result = analyze(wrapped);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // Whitespace is stripped before measuring, so the two agree here.
    expect(result.value.pastedBase64Length).toBe(twoOperationXdr.length);
    expect(result.value.normalizedBase64Length).toBe(twoOperationXdr.length);
  });

  it("sums its sections to the measured total exactly", () => {
    for (const envelope of [singleOperationXdr, twoOperationXdr, signedXdr, v0Xdr]) {
      const result = analyze(envelope);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.breakdownComplete).toBe(true);
      expect(sumOf(result.value.outer)).toBe(result.value.totalBytes);
    }
  });

  it("accounts for the envelope discriminant and both vector length prefixes", () => {
    const result = analyze(singleOperationXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const sections = sectionsOf(result.value.outer);
    expect(sections.envelope_discriminant).toBe(XDR_WORD);
    // One operation: a 4-byte count plus the operation itself.
    expect(sections.operations).toBe(XDR_WORD + result.value.outer.operationBytes[0]);
    // No signatures: the vector is just its own length prefix.
    expect(sections.signatures).toBe(XDR_WORD);
  });

  it("grows only the signature vector when a signature is added", () => {
    const unsigned = analyze(twoOperationXdr);
    const signed = analyze(signedXdr);
    const twice = analyze(twiceSignedXdr);

    expect(unsigned.ok && signed.ok && twice.ok).toBe(true);
    if (!unsigned.ok || !signed.ok || !twice.ok) return;

    const unsignedSections = sectionsOf(unsigned.value.outer);
    const signedSections = sectionsOf(signed.value.outer);
    const twiceSections = sectionsOf(twice.value.outer);

    expect(signedSections.transaction_body).toBe(unsignedSections.transaction_body);
    expect(signedSections.operations).toBe(unsignedSections.operations);
    expect(signedSections.signatures).toBeGreaterThan(unsignedSections.signatures);

    // A second signature adds the same number of bytes as the first.
    const firstDelta = signedSections.signatures - unsignedSections.signatures;
    const secondDelta = twiceSections.signatures - signedSections.signatures;
    expect(secondDelta).toBe(firstDelta);
    expect(twice.value.outer.signatureCount).toBe(2);
  });

  it("grows only the transaction body when the memo grows", () => {
    const short = analyze(shortMemoXdr);
    const long = analyze(longMemoXdr);

    expect(short.ok && long.ok).toBe(true);
    if (!short.ok || !long.ok) return;

    const shortSections = sectionsOf(short.value.outer);
    const longSections = sectionsOf(long.value.outer);

    expect(longSections.operations).toBe(shortSections.operations);
    expect(longSections.signatures).toBe(shortSections.signatures);
    expect(longSections.transaction_body).toBeGreaterThan(shortSections.transaction_body);
  });

  it("grows only the operations vector when an operation is added", () => {
    const one = analyze(singleOperationXdr);
    const two = analyze(twoOperationXdr);

    expect(one.ok && two.ok).toBe(true);
    if (!one.ok || !two.ok) return;
    expect(sectionsOf(two.value.outer).operations).toBeGreaterThan(
      sectionsOf(one.value.outer).operations
    );
    expect(two.value.outer.operationCount).toBe(2);
    expect(two.value.outer.operationBytes).toHaveLength(2);
  });

  it("counts a fee bump's inner transaction once", () => {
    const result = analyze(feeBumpXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.kind).toBe("fee-bump");
    expect(result.value.inner).not.toBeNull();
    if (!result.value.inner) return;

    // The inner section of the outer envelope IS the inner layer's total.
    expect(sectionsOf(result.value.outer).inner_envelope).toBe(result.value.inner.totalBytes);
    expect(sumOf(result.value.outer)).toBe(result.value.totalBytes);
    expect(sumOf(result.value.inner)).toBe(result.value.inner.totalBytes);
    // And the outer total is not the sum of two full envelopes.
    expect(result.value.totalBytes).toBeLessThan(result.value.inner.totalBytes * 2);
  });

  it("keeps outer and inner signature vectors apart in a fee bump", () => {
    const signedOuter = analyze(feeBumpXdr);
    const unsignedOuter = analyze(unsignedFeeBumpXdr);

    expect(signedOuter.ok && unsignedOuter.ok).toBe(true);
    if (!signedOuter.ok || !unsignedOuter.ok) return;

    expect(signedOuter.value.outer.signatureCount).toBe(1);
    expect(unsignedOuter.value.outer.signatureCount).toBe(0);
    // The inner layer is untouched by whether the wrapper is signed.
    expect(unsignedOuter.value.inner?.signatureCount).toBe(1);
    expect(unsignedOuter.value.inner?.totalBytes).toBe(signedOuter.value.inner?.totalBytes);
  });

  it("measures a v0 envelope", () => {
    const result = analyze(v0Xdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.kind).toBe("classic-v0");
    expect(result.value.inner).toBeNull();
    expect(sumOf(result.value.outer)).toBe(result.value.totalBytes);
  });

  it("reports headroom when inside a budget", () => {
    const measured = analyze(singleOperationXdr);
    expect(measured.ok).toBe(true);
    if (!measured.ok) return;

    const result = analyze(singleOperationXdr, String(measured.value.totalBytes + 100));

    expect(result.ok && result.value.budget).toEqual({
      budgetBytes: measured.value.totalBytes + 100,
      withinBudget: true,
      headroomBytes: 100,
      overageBytes: 0
    });
  });

  it("reports overage when past a budget", () => {
    const measured = analyze(singleOperationXdr);
    expect(measured.ok).toBe(true);
    if (!measured.ok) return;

    const result = analyze(singleOperationXdr, String(measured.value.totalBytes - 10));

    expect(result.ok && result.value.budget).toMatchObject({
      withinBudget: false,
      headroomBytes: 0,
      overageBytes: 10
    });
  });

  it("treats a budget equal to the size as within budget", () => {
    const measured = analyze(singleOperationXdr);
    expect(measured.ok).toBe(true);
    if (!measured.ok) return;

    const result = analyze(singleOperationXdr, String(measured.value.totalBytes));

    expect(result.ok && result.value.budget).toMatchObject({
      withinBudget: true,
      headroomBytes: 0
    });
  });

  it("omits the budget entirely when none was given", () => {
    const result = analyze(singleOperationXdr);
    expect(result.ok && result.value.budget).toBeNull();
  });

  it("rejects valid base64 that is not a transaction envelope", () => {
    expect(analyze(notAnEnvelopeXdr)).toEqual({ ok: false, code: "invalid_xdr" });
  });
});

describe("assessBudget", () => {
  it("never reports headroom and overage at the same time", () => {
    expect(assessBudget(100, 120)).toEqual({
      budgetBytes: 120,
      withinBudget: true,
      headroomBytes: 20,
      overageBytes: 0
    });
    expect(assessBudget(140, 120)).toEqual({
      budgetBytes: 120,
      withinBudget: false,
      headroomBytes: 0,
      overageBytes: 20
    });
  });
});
