import { describe, expect, it } from "vitest";
import {
  auditSignerRotation,
  toJsonSummary
} from "@/features/signer-rotation-impact-auditor/lib/signerRotationImpactAuditor";
import {
  accountId,
  cosignerId,
  duplicateSignerXdr,
  feeBumpSafeXdr,
  finalLockoutXdr,
  foreignSourceXdr,
  normalSnapshot,
  notAccountJson,
  notAnEnvelopeXdr,
  PASSPHRASE,
  recoveredRotationXdr,
  safeRotationXdr,
  zeroWeightRemovalXdr
} from "@/features/signer-rotation-impact-auditor/fixtures/normal.fixture";
import {
  incompleteEvidenceInput,
  missingSignersSnapshot
} from "@/features/signer-rotation-impact-auditor/fixtures/boundary.fixture";

describe("auditSignerRotation", () => {
  it("audits a safe rotation without lockout", () => {
    const result = auditSignerRotation({
      accountSnapshot: normalSnapshot,
      envelopeXdr: safeRotationXdr,
      networkPassphrase: PASSPHRASE
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.accountId).toBe(accountId);
    expect(result.value.evidence.complete).toBe(true);
    expect(result.value.lockout.finalLockout).toBe(false);
    expect(result.value.finalTotalWeight).toBe("3");
  });

  it("reports recovered final state after intermediate lockout", () => {
    const result = auditSignerRotation({
      accountSnapshot: normalSnapshot,
      envelopeXdr: recoveredRotationXdr,
      networkPassphrase: PASSPHRASE
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.lockout).toMatchObject({
      intermediateLockout: true,
      finalLockout: false,
      recoveredFinal: true,
      firstLockingStepIndex: 0
    });
  });

  it("reports final lockout with first locking operation", () => {
    const result = auditSignerRotation({
      accountSnapshot: normalSnapshot,
      envelopeXdr: finalLockoutXdr,
      networkPassphrase: PASSPHRASE
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.lockout.finalLockout).toBe(true);
    expect(result.value.lockout.firstLockingStepIndex).toBe(0);
    expect(result.value.finalTotalWeight).toBe("0");
  });

  it("removes a signer on zero weight", () => {
    const result = auditSignerRotation({
      accountSnapshot: normalSnapshot,
      envelopeXdr: zeroWeightRemovalXdr,
      networkPassphrase: PASSPHRASE
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.finalSigners.some((signer) => signer.key === cosignerId)).toBe(false);
    expect(result.value.finalTotalWeight).toBe("1");
  });

  it("handles duplicate signer keys with last-write-wins", () => {
    const result = auditSignerRotation({
      accountSnapshot: normalSnapshot,
      envelopeXdr: duplicateSignerXdr,
      networkPassphrase: PASSPHRASE
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(
      result.value.finalSigners.find((signer) => signer.key === cosignerId)?.weight
    ).toBe("2");
  });

  it("skips foreign-source operations without mutating the snapshot", () => {
    const result = auditSignerRotation({
      accountSnapshot: normalSnapshot,
      envelopeXdr: foreignSourceXdr,
      networkPassphrase: PASSPHRASE
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.steps[0].appliesToSnapshot).toBe(false);
    expect(result.value.finalTotalWeight).toBe(result.value.initialTotalWeight);
  });

  it("marks missing signer evidence as incomplete rather than inventing weights", () => {
    const result = auditSignerRotation({
      ...incompleteEvidenceInput,
      accountSnapshot: missingSignersSnapshot
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.evidence.hasSigners).toBe(false);
    expect(result.value.evidence.complete).toBe(false);
    expect(result.value.initialReachability.every((entry) => entry.reachable === null)).toBe(
      true
    );
  });

  it("supports fee-bump envelopes via the inner transaction", () => {
    const result = auditSignerRotation({
      accountSnapshot: normalSnapshot,
      envelopeXdr: feeBumpSafeXdr,
      networkPassphrase: PASSPHRASE
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.envelopeKind).toBe("fee-bump");
    expect(result.value.finalTotalWeight).toBe("3");
  });

  it("rejects malformed account JSON and undecodable envelopes", () => {
    expect(
      auditSignerRotation({
        accountSnapshot: notAccountJson,
        envelopeXdr: safeRotationXdr,
        networkPassphrase: PASSPHRASE
      })
    ).toEqual({ ok: false, code: "malformed_data" });

    expect(
      auditSignerRotation({
        accountSnapshot: normalSnapshot,
        envelopeXdr: notAnEnvelopeXdr,
        networkPassphrase: PASSPHRASE
      })
    ).toEqual({ ok: false, code: "malformed_data" });
  });

  it("exports deterministic JSON", () => {
    const result = auditSignerRotation({
      accountSnapshot: normalSnapshot,
      envelopeXdr: safeRotationXdr,
      networkPassphrase: PASSPHRASE
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const first = toJsonSummary(result.value);
    const second = toJsonSummary(result.value);
    expect(first).toBe(second);
    expect(first).toContain(accountId);
  });
});
