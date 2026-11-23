import { describe, expect, it } from "vitest";
import {
  normalizeRotationSteps,
  parseAccountSnapshot,
  parseEnvelope
} from "@/features/signer-rotation-impact-auditor/lib/rotation-steps";
import {
  accountId,
  cosignerId,
  duplicateSignerXdr,
  foreignSourceXdr,
  mixedOpsXdr,
  normalSnapshot,
  notAccountJson,
  notAnEnvelopeXdr,
  PASSPHRASE,
  safeRotationXdr,
  zeroWeightRemovalXdr
} from "@/features/signer-rotation-impact-auditor/fixtures/normal.fixture";
import { missingSignersSnapshot } from "@/features/signer-rotation-impact-auditor/fixtures/boundary.fixture";

describe("rotation-steps", () => {
  it("parses a Horizon account with signers and thresholds", () => {
    const parsed = parseAccountSnapshot(normalSnapshot);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.accountId).toBe(accountId);
    expect(parsed.value.hasSigners).toBe(true);
    expect(parsed.value.hasThresholds).toBe(true);
    expect(parsed.value.signers).toHaveLength(2);
    expect(parsed.value.thresholds).toEqual({ low: "1", medium: "1", high: "2" });
  });

  it("marks missing signers as absent evidence without inventing them", () => {
    const parsed = parseAccountSnapshot(missingSignersSnapshot);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.hasSigners).toBe(false);
    expect(parsed.value.signers).toEqual([]);
  });

  it("rejects JSON that is not an account", () => {
    expect(parseAccountSnapshot(notAccountJson)).toEqual({
      ok: false,
      code: "malformed_data"
    });
  });

  it("decodes set_options operations with inherited source", () => {
    const envelope = parseEnvelope(safeRotationXdr, PASSPHRASE);
    expect(envelope.ok).toBe(true);
    if (!envelope.ok) return;
    expect(envelope.value.kind).toBe("classic-v1");
    expect(envelope.value.operations).toHaveLength(2);
    expect(envelope.value.operations.every((op) => op.setOptions !== null)).toBe(true);
    expect(envelope.value.operations[0].inheritedSource).toBe(true);
    expect(envelope.value.operations[0].effectiveSource).toBe(accountId);
  });

  it("rejects undecodable envelopes", () => {
    expect(parseEnvelope(notAnEnvelopeXdr, PASSPHRASE)).toEqual({
      ok: false,
      code: "malformed_data"
    });
  });

  it("normalizes zero-weight removal and duplicate overwrites in order", () => {
    const snapshot = parseAccountSnapshot(normalSnapshot);
    expect(snapshot.ok).toBe(true);
    if (!snapshot.ok) return;

    const zero = parseEnvelope(zeroWeightRemovalXdr, PASSPHRASE);
    expect(zero.ok).toBe(true);
    if (!zero.ok) return;

    const zeroSteps = normalizeRotationSteps(zero.value.operations, accountId, {
      signers: snapshot.value.signers,
      thresholds: snapshot.value.thresholds
    });
    expect(zeroSteps[0].changes.some((change) => change.kind === "signer_remove")).toBe(true);
    expect(zeroSteps[0].changes[0].target).toBe(cosignerId);
    expect(zeroSteps[0].changes[0].after).toBe("0");

    const dup = parseEnvelope(duplicateSignerXdr, PASSPHRASE);
    expect(dup.ok).toBe(true);
    if (!dup.ok) return;

    const dupSteps = normalizeRotationSteps(dup.value.operations, accountId, {
      signers: snapshot.value.signers,
      thresholds: snapshot.value.thresholds
    });
    expect(dupSteps[0].changes[0].after).toBe("5");
    expect(dupSteps[1].changes[0].before).toBe("5");
    expect(dupSteps[1].changes[0].after).toBe("2");
  });

  it("does not apply foreign-source set_options to the snapshot account", () => {
    const snapshot = parseAccountSnapshot(normalSnapshot);
    expect(snapshot.ok).toBe(true);
    if (!snapshot.ok) return;

    const envelope = parseEnvelope(foreignSourceXdr, PASSPHRASE);
    expect(envelope.ok).toBe(true);
    if (!envelope.ok) return;

    const steps = normalizeRotationSteps(envelope.value.operations, accountId, {
      signers: snapshot.value.signers,
      thresholds: snapshot.value.thresholds
    });

    expect(steps[0].appliesToSnapshot).toBe(false);
    expect(steps[0].changes).toEqual([]);
  });

  it("records non set-options ops on the snapshot as ignored", () => {
    const snapshot = parseAccountSnapshot(normalSnapshot);
    expect(snapshot.ok).toBe(true);
    if (!snapshot.ok) return;

    const envelope = parseEnvelope(mixedOpsXdr, PASSPHRASE);
    expect(envelope.ok).toBe(true);
    if (!envelope.ok) return;

    const steps = normalizeRotationSteps(envelope.value.operations, accountId, {
      signers: snapshot.value.signers,
      thresholds: snapshot.value.thresholds
    });

    expect(steps[0].changes[0].kind).toBe("ignored_operation");
    expect(steps[1].operationType).toBe("setOptions");
  });
});
