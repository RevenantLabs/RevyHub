import { describe, expect, it } from "vitest";
import { decodeDecoratedSignatures } from "@/features/signature-hint-auditor/lib/decorated-signatures";
import {
  feeBumpXdr,
  feeSourceHint,
  multiSignedClassicXdr,
  notAnEnvelopeXdr,
  signedClassicXdr,
  signedV0Xdr,
  sourceHint,
  unsignedClassicXdr,
  unsignedFeeBumpXdr,
  extraSignerHint
} from "@/features/signature-hint-auditor/fixtures/signatureHintAuditor.fixture";

describe("decodeDecoratedSignatures", () => {
  it("lists classic v1 hints in envelope order", () => {
    const result = decodeDecoratedSignatures(multiSignedClassicXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.variant).toBe("classic-v1");
    expect(result.value.entries.map((entry) => entry.hint)).toEqual([
      sourceHint,
      extraSignerHint
    ]);
    expect(result.value.entries.every((entry) => entry.group === "transaction")).toBe(true);
  });

  it("preserves zero-based indexes inside the group", () => {
    const result = decodeDecoratedSignatures(multiSignedClassicXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.entries.map((entry) => entry.index)).toEqual([0, 1]);
  });

  it("handles an empty signature vector", () => {
    const result = decodeDecoratedSignatures(unsignedClassicXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.entries).toEqual([]);
  });

  it("separates fee-bump outer and inner groups", () => {
    const result = decodeDecoratedSignatures(feeBumpXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.variant).toBe("fee-bump");
    expect(result.value.entries).toEqual([
      { index: 0, hint: feeSourceHint, group: "fee_bump_outer" },
      { index: 0, hint: sourceHint, group: "fee_bump_inner" }
    ]);
  });

  it("keeps empty fee-bump groups as empty entries rather than inventing rows", () => {
    const result = decodeDecoratedSignatures(unsignedFeeBumpXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.entries).toEqual([]);
  });

  it("decodes classic v0 envelopes", () => {
    const result = decodeDecoratedSignatures(signedV0Xdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.variant).toBe("classic-v0");
    expect(result.value.entries[0]?.hint).toBe(sourceHint);
  });

  it("rejects valid base64 that is not an envelope", () => {
    expect(decodeDecoratedSignatures(notAnEnvelopeXdr)).toEqual({
      ok: false,
      code: "invalid_xdr"
    });
  });

  it("returns a single signed classic hint", () => {
    const result = decodeDecoratedSignatures(signedClassicXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.entries).toHaveLength(1);
    expect(result.value.entries[0]?.hint).toMatch(/^[0-9a-f]{8}$/);
  });
});
