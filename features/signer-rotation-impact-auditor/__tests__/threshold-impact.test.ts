import { describe, expect, it } from "vitest";
import {
  anyUnreachable,
  buildLockoutReport,
  evaluateReachability,
  evaluateStepImpacts,
  totalWeight
} from "@/features/signer-rotation-impact-auditor/lib/threshold-impact";
import {
  normalizeRotationSteps,
  parseAccountSnapshot,
  parseEnvelope
} from "@/features/signer-rotation-impact-auditor/lib/rotation-steps";
import {
  accountId,
  cosignerId,
  duplicateSignerXdr,
  finalLockoutXdr,
  normalSnapshot,
  PASSPHRASE,
  recoveredRotationXdr,
  safeRotationXdr
} from "@/features/signer-rotation-impact-auditor/fixtures/normal.fixture";

function stepsFor(xdr: string) {
  const snapshot = parseAccountSnapshot(normalSnapshot);
  if (!snapshot.ok) throw new Error("snapshot");
  const envelope = parseEnvelope(xdr, PASSPHRASE);
  if (!envelope.ok) throw new Error("envelope");
  const steps = normalizeRotationSteps(envelope.value.operations, accountId, {
    signers: snapshot.value.signers,
    thresholds: snapshot.value.thresholds
  });
  return { snapshot: snapshot.value, steps };
}

describe("threshold-impact", () => {
  it("sums weights with BigInt exactness", () => {
    expect(
      totalWeight([
        { key: accountId, weight: "1", kind: "ed25519_public_key", isMaster: true },
        { key: cosignerId, weight: "2", kind: "ed25519_public_key", isMaster: false }
      ])
    ).toBe("3");
  });

  it("reports exact shortfalls and unavailable evidence", () => {
    const reachable = evaluateReachability(
      { low: "1", medium: "2", high: "5" },
      "3"
    );
    expect(reachable.find((entry) => entry.level === "high")).toMatchObject({
      shortfall: "2",
      reachable: false
    });
    expect(reachable.find((entry) => entry.level === "medium")).toMatchObject({
      shortfall: "0",
      reachable: true
    });

    const unavailable = evaluateReachability({ low: null, medium: null, high: null }, null);
    expect(unavailable.every((entry) => entry.reachable === null)).toBe(true);
    expect(anyUnreachable(unavailable)).toBe(false);
  });

  it("keeps a safe rotation reachable at every step", () => {
    const { snapshot, steps } = stepsFor(safeRotationXdr);
    const { impacts, finalSigners } = evaluateStepImpacts(
      snapshot.signers,
      snapshot.thresholds,
      steps,
      accountId
    );

    expect(impacts.every((impact) => !impact.anyUnreachable)).toBe(true);
    expect(totalWeight(finalSigners)).toBe("3");
    expect(buildLockoutReport(impacts)).toMatchObject({
      intermediateLockout: false,
      finalLockout: false,
      firstLockingStepIndex: null,
      recoveredFinal: false
    });
  });

  it("detects intermediate lockout then recovery", () => {
    const { snapshot, steps } = stepsFor(recoveredRotationXdr);
    const { impacts } = evaluateStepImpacts(
      snapshot.signers,
      snapshot.thresholds,
      steps,
      accountId
    );

    expect(impacts[0].anyUnreachable).toBe(true);
    expect(impacts[0].newlyUnreachable).toContain("high");
    expect(impacts[1].anyUnreachable).toBe(false);
    expect(impacts[1].recovered).toContain("high");

    expect(buildLockoutReport(impacts)).toMatchObject({
      intermediateLockout: true,
      finalLockout: false,
      firstLockingStepIndex: 0,
      recoveredFinal: true
    });
  });

  it("detects a final lockout and the first locking op", () => {
    const { snapshot, steps } = stepsFor(finalLockoutXdr);
    const { impacts } = evaluateStepImpacts(
      snapshot.signers,
      snapshot.thresholds,
      steps,
      accountId
    );

    const report = buildLockoutReport(impacts);
    expect(report.finalLockout).toBe(true);
    expect(report.intermediateLockout).toBe(true);
    expect(report.firstLockingStepIndex).toBe(0);
    expect(report.lockedLevelsFinal.length).toBeGreaterThan(0);
  });

  it("applies duplicate signer weights in order (last write wins)", () => {
    const { snapshot, steps } = stepsFor(duplicateSignerXdr);
    const { finalSigners } = evaluateStepImpacts(
      snapshot.signers,
      snapshot.thresholds,
      steps,
      accountId
    );

    const cosigner = finalSigners.find((signer) => signer.key === cosignerId);
    expect(cosigner?.weight).toBe("2");
    expect(totalWeight(finalSigners)).toBe("3");
  });
});
