import { err, ok, type Result } from "@/core/result/result";
import { sortSigners } from "@/features/signer-rotation-impact-auditor/lib/format";
import { toSignerRotationErrorCode } from "@/features/signer-rotation-impact-auditor/lib/signerRotationImpactAuditor.errors";
import {
  normalizeRotationSteps,
  parseAccountSnapshot,
  parseEnvelope
} from "@/features/signer-rotation-impact-auditor/lib/rotation-steps";
import {
  buildLockoutReport,
  evaluateReachability,
  evaluateStepImpacts,
  totalWeight
} from "@/features/signer-rotation-impact-auditor/lib/threshold-impact";
import type {
  SignerRotationErrorCode,
  SignerRotationInput,
  SignerRotationResult
} from "@/features/signer-rotation-impact-auditor/types";

/**
 * Compares a Horizon account signer snapshot with a proposed set-options
 * rotation and reports threshold reachability after every step.
 *
 * Advisory only: nothing is submitted and signatures are never verified.
 */
export function auditSignerRotation(
  input: SignerRotationInput
): Result<SignerRotationResult, SignerRotationErrorCode> {
  try {
    const snapshot = parseAccountSnapshot(input.accountSnapshot);
    if (!snapshot.ok) return snapshot;

    const envelope = parseEnvelope(input.envelopeXdr, input.networkPassphrase);
    if (!envelope.ok) return envelope;

    const initialSigners = sortSigners(snapshot.value.signers);
    const initialThresholds = snapshot.value.thresholds;
    const steps = normalizeRotationSteps(
      envelope.value.operations,
      snapshot.value.accountId,
      {
        signers: initialSigners,
        thresholds: initialThresholds
      }
    );

    const hasSetOptions = steps.some((step) => step.operationType === "setOptions");
    const evidenceComplete =
      snapshot.value.hasSigners && snapshot.value.hasThresholds && hasSetOptions;

    const { impacts, finalSigners, finalThresholds } = evaluateStepImpacts(
      initialSigners,
      initialThresholds,
      steps,
      snapshot.value.accountId,
      {
        // Without both evidence sources, never invent a lockout claim.
        allowReachability: snapshot.value.hasSigners && snapshot.value.hasThresholds
      }
    );

    const initialTotalWeight = snapshot.value.hasSigners ? totalWeight(initialSigners) : null;
    const finalTotalWeight = snapshot.value.hasSigners ? totalWeight(finalSigners) : null;

    const initialReachability =
      snapshot.value.hasSigners && snapshot.value.hasThresholds
        ? evaluateReachability(initialThresholds, initialTotalWeight)
        : evaluateReachability(
            { low: null, medium: null, high: null },
            null
          );

    const finalReachability =
      snapshot.value.hasSigners && snapshot.value.hasThresholds
        ? evaluateReachability(finalThresholds, finalTotalWeight)
        : evaluateReachability(
            { low: null, medium: null, high: null },
            null
          );

    return ok({
      accountId: snapshot.value.accountId,
      envelopeKind: envelope.value.kind,
      networkPassphrase: input.networkPassphrase,
      initialSigners,
      initialThresholds,
      initialTotalWeight,
      initialReachability,
      steps,
      impacts,
      finalSigners,
      finalThresholds,
      finalTotalWeight,
      finalReachability,
      lockout: evidenceComplete
        ? buildLockoutReport(impacts)
        : {
            intermediateLockout: false,
            finalLockout: false,
            firstLockingStepIndex: null,
            lockedLevelsFinal: [],
            recoveredFinal: false
          },
      evidence: {
        hasSigners: snapshot.value.hasSigners,
        hasThresholds: snapshot.value.hasThresholds,
        hasSetOptions,
        complete: evidenceComplete
      }
    });
  } catch (error) {
    return err(toSignerRotationErrorCode(error));
  }
}

/**
 * Deterministic JSON export — fixed key order, no timestamps.
 */
export function toJsonSummary(result: SignerRotationResult): string {
  return JSON.stringify(
    {
      accountId: result.accountId,
      envelopeKind: result.envelopeKind,
      networkPassphrase: result.networkPassphrase,
      evidence: result.evidence,
      initial: {
        totalWeight: result.initialTotalWeight,
        thresholds: result.initialThresholds,
        signers: result.initialSigners,
        reachability: result.initialReachability
      },
      steps: result.steps.map((step) => ({
        index: step.index,
        operationType: step.operationType,
        effectiveSource: step.effectiveSource,
        inheritedSource: step.inheritedSource,
        appliesToSnapshot: step.appliesToSnapshot,
        changes: step.changes
      })),
      impacts: result.impacts.map((impact) => ({
        stepIndex: impact.stepIndex,
        totalWeight: impact.totalWeight,
        thresholds: impact.afterThresholds,
        reachability: impact.reachability,
        anyUnreachable: impact.anyUnreachable,
        newlyUnreachable: impact.newlyUnreachable,
        recovered: impact.recovered
      })),
      final: {
        totalWeight: result.finalTotalWeight,
        thresholds: result.finalThresholds,
        signers: result.finalSigners,
        reachability: result.finalReachability
      },
      lockout: result.lockout
    },
    null,
    2
  );
}
