import { describe, expect, it } from "vitest";
import { auditSignatureHints } from "@/features/signature-hint-auditor/lib/signatureHintAuditor";
import {
  countCollisions,
  matchDecoratedHint
} from "@/features/signature-hint-auditor/lib/hint-candidates";
import { parseSignatureHintAuditorInput } from "@/features/signature-hint-auditor/schema";
import {
  collidingCandidates,
  collisionEnvelopeXdr,
  collisionHint
} from "@/features/signature-hint-auditor/fixtures/hint-collision.fixture";
import {
  feeBumpXdr,
  feeSource,
  multiSignedClassicXdr,
  notAnEnvelopeXdr,
  signedClassicXdr,
  source,
  sourceHint,
  unrelatedSigner,
  unsignedClassicXdr,
  extraSigner
} from "@/features/signature-hint-auditor/fixtures/signatureHintAuditor.fixture";
import {
  matchingPublicKeys,
  multiSignatureEnvelopeXdr
} from "@/features/signature-hint-auditor/fixtures/signatures.fixture";

function audit(envelope: string, publicSigners: string[] = []) {
  const parsed = parseSignatureHintAuditorInput({
    envelope,
    publicSigners: publicSigners.join("\n")
  });
  if (!parsed.ok) throw new Error(`fixture failed to parse: ${parsed.code}`);
  return auditSignatureHints(parsed.value);
}

describe("auditSignatureHints", () => {
  it("matches a single provided public key to its hint", () => {
    const result = audit(signedClassicXdr, [source.publicKey()]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.signatureCount).toBe(1);
    expect(result.value.groups[0]?.signatures[0]).toMatchObject({
      hint: sourceHint,
      matchKind: "single",
      candidates: [source.publicKey()]
    });
    expect(result.value.unmatchedCount).toBe(0);
    expect(result.value.collisionCount).toBe(0);
  });

  it("leaves every hint unmatched when no public keys are provided", () => {
    const result = audit(signedClassicXdr);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.providedSigners).toEqual([]);
    expect(result.value.unmatchedCount).toBe(1);
    expect(result.value.groups[0]?.signatures[0]?.matchKind).toBe("none");
  });

  it("keeps multi-signature hints in envelope order", () => {
    const result = audit(multiSignatureEnvelopeXdr, matchingPublicKeys);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.groups[0]?.signatures.map((row) => row.matchKind)).toEqual([
      "single",
      "single"
    ]);
    expect(result.value.groups[0]?.signatures[0]?.candidates[0]).toBe(matchingPublicKeys[0]);
    expect(result.value.groups[0]?.signatures[1]?.candidates[0]).toBe(matchingPublicKeys[1]);
  });

  it("separates fee-bump outer and inner signature groups", () => {
    const result = audit(feeBumpXdr, [feeSource.publicKey(), source.publicKey()]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.variant).toBe("fee-bump");
    expect(result.value.groups.map((group) => group.group)).toEqual([
      "fee_bump_outer",
      "fee_bump_inner"
    ]);
    expect(result.value.groups[0]?.signatures[0]?.matchKind).toBe("single");
    expect(result.value.groups[1]?.signatures[0]?.matchKind).toBe("single");
  });

  it("reports an unmatched hint when the wrong public key is provided", () => {
    const result = audit(signedClassicXdr, [unrelatedSigner.publicKey()]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.unmatchedCount).toBe(1);
    expect(result.value.groups[0]?.signatures[0]?.candidates).toEqual([]);
  });

  it("handles an empty signature vector", () => {
    const result = audit(unsignedClassicXdr, [source.publicKey()]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.signatureCount).toBe(0);
    expect(result.value.groups[0]?.signatures).toEqual([]);
  });

  it("rejects undecodable envelope bytes", () => {
    expect(audit(notAnEnvelopeXdr)).toEqual({ ok: false, code: "invalid_xdr" });
  });

  it("surfaces collisions when two candidates share a hint", () => {
    const decoded = audit(collisionEnvelopeXdr);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;

    const forcedMatch = matchDecoratedHint(
      {
        index: 0,
        hint: collisionHint,
        group: "transaction"
      },
      collidingCandidates
    );

    expect(forcedMatch.matchKind).toBe("collision");
    expect(forcedMatch.candidates).toHaveLength(2);
    expect(countCollisions([forcedMatch])).toBe(1);
    expect(decoded.value.groups[0]?.signatures[0]?.hint).toBe(collisionHint);
  });

  it("still matches when an extra unrelated key is present", () => {
    const result = audit(multiSignedClassicXdr, [
      source.publicKey(),
      extraSigner.publicKey(),
      unrelatedSigner.publicKey()
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.collisionCount).toBe(0);
    expect(result.value.unmatchedCount).toBe(0);
    expect(result.value.providedSigners).toHaveLength(3);
  });
});
