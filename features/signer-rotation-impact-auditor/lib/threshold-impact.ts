import { sortSigners } from "@/features/signer-rotation-impact-auditor/lib/format";
import type {
  AccountThresholds,
  LockoutReport,
  RotationStep,
  SignerEntry,
  StepImpact,
  ThresholdLevel,
  ThresholdReachability
} from "@/features/signer-rotation-impact-auditor/types";

const LEVELS: readonly ThresholdLevel[] = ["low", "medium", "high"];

/** Sums signer weights with BigInt so nothing is rounded. */
export function totalWeight(signers: SignerEntry[]): string | null {
  if (signers.length === 0) return "0";
  try {
    return signers
      .reduce((sum, signer) => sum + BigInt(signer.weight), 0n)
      .toString();
  } catch {
    return null;
  }
}

/**
 * Exact integer comparison of available weight against each threshold.
 *
 * A missing threshold or missing total weight yields `reachable: null` —
 * incomplete evidence must not become a successful assertion.
 */
export function evaluateReachability(
  thresholds: AccountThresholds,
  available: string | null
): ThresholdReachability[] {
  return LEVELS.map((level) => {
    const required = thresholds[level];
    if (required === null || available === null) {
      return {
        level,
        required,
        available,
        shortfall: null,
        reachable: null
      };
    }

    const need = BigInt(required);
    const have = BigInt(available);
    const shortfall = need > have ? (need - have).toString() : "0";

    return {
      level,
      required,
      available,
      shortfall,
      reachable: have >= need
    };
  });
}

export function anyUnreachable(reachability: ThresholdReachability[]): boolean {
  return reachability.some((entry) => entry.reachable === false);
}

function cloneSigners(signers: SignerEntry[]): SignerEntry[] {
  return signers.map((signer) => ({ ...signer }));
}

function applyStep(
  signers: SignerEntry[],
  thresholds: AccountThresholds,
  step: RotationStep,
  accountId: string
): { signers: SignerEntry[]; thresholds: AccountThresholds } {
  if (!step.appliesToSnapshot) {
    return { signers, thresholds: { ...thresholds } };
  }

  const nextSigners = new Map(signers.map((signer) => [signer.key, { ...signer }] as const));
  const nextThresholds: AccountThresholds = { ...thresholds };

  for (const change of step.changes) {
    switch (change.kind) {
      case "master_weight": {
        if (change.after === null) break;
        if (change.after === "0") {
          nextSigners.delete(accountId);
        } else {
          nextSigners.set(accountId, {
            key: accountId,
            weight: change.after,
            kind: "ed25519_public_key",
            isMaster: true
          });
        }
        break;
      }
      case "threshold_low":
        nextThresholds.low = change.after;
        break;
      case "threshold_medium":
        nextThresholds.medium = change.after;
        break;
      case "threshold_high":
        nextThresholds.high = change.after;
        break;
      case "signer_set": {
        if (change.target === null || change.after === null) break;
        const existing = nextSigners.get(change.target);
        nextSigners.set(change.target, {
          key: change.target,
          weight: change.after,
          kind: existing?.kind ?? "ed25519_public_key",
          isMaster: change.target === accountId
        });
        break;
      }
      case "signer_remove":
        if (change.target) nextSigners.delete(change.target);
        break;
      case "ignored_operation":
        break;
    }
  }

  return {
    signers: sortSigners([...nextSigners.values()]),
    thresholds: nextThresholds
  };
}

function newlyUnreachableLevels(
  before: ThresholdReachability[],
  after: ThresholdReachability[]
): ThresholdLevel[] {
  return LEVELS.filter((level) => {
    const prior = before.find((entry) => entry.level === level);
    const next = after.find((entry) => entry.level === level);
    return prior?.reachable !== false && next?.reachable === false;
  });
}

function recoveredLevels(
  before: ThresholdReachability[],
  after: ThresholdReachability[]
): ThresholdLevel[] {
  return LEVELS.filter((level) => {
    const prior = before.find((entry) => entry.level === level);
    const next = after.find((entry) => entry.level === level);
    return prior?.reachable === false && next?.reachable === true;
  });
}

/**
 * Walks the ordered steps, applying signer/threshold mutations and computing
 * reachability after every applied operation.
 */
export function evaluateStepImpacts(
  initialSigners: SignerEntry[],
  initialThresholds: AccountThresholds,
  steps: RotationStep[],
  accountId: string,
  options: { allowReachability?: boolean } = {}
): { impacts: StepImpact[]; finalSigners: SignerEntry[]; finalThresholds: AccountThresholds } {
  const allowReachability = options.allowReachability !== false;
  let signers = sortSigners(cloneSigners(initialSigners));
  let thresholds: AccountThresholds = { ...initialThresholds };
  let previousReachability = allowReachability
    ? evaluateReachability(thresholds, totalWeight(signers))
    : evaluateReachability({ low: null, medium: null, high: null }, null);
  const impacts: StepImpact[] = [];

  for (const step of steps) {
    const applied = applyStep(signers, thresholds, step, accountId);
    signers = applied.signers;
    thresholds = applied.thresholds;

    const available = allowReachability ? totalWeight(signers) : null;
    const reachability = allowReachability
      ? evaluateReachability(thresholds, available)
      : evaluateReachability({ low: null, medium: null, high: null }, null);

    impacts.push({
      stepIndex: step.index,
      afterSigners: cloneSigners(signers),
      afterThresholds: { ...thresholds },
      totalWeight: available,
      reachability,
      anyUnreachable: anyUnreachable(reachability),
      newlyUnreachable: newlyUnreachableLevels(previousReachability, reachability),
      recovered: recoveredLevels(previousReachability, reachability)
    });

    previousReachability = reachability;
  }

  return { impacts, finalSigners: signers, finalThresholds: thresholds };
}

/**
 * Distinguishes an intermediate lockout from a final one and records the first
 * operation that introduced an unreachable threshold.
 */
export function buildLockoutReport(impacts: StepImpact[]): LockoutReport {
  const applied = impacts.filter((impact) => impact.afterSigners !== undefined);
  let firstLockingStepIndex: number | null = null;
  let sawIntermediateLockout = false;

  for (let index = 0; index < applied.length; index += 1) {
    const impact = applied[index];
    if (!impact.anyUnreachable) continue;

    if (firstLockingStepIndex === null) firstLockingStepIndex = impact.stepIndex;

    // Intermediate means any unreachable state before the final impact.
    if (index < applied.length - 1) sawIntermediateLockout = true;
  }

  const final = applied[applied.length - 1];
  const finalLockout = final ? final.anyUnreachable : false;
  const lockedLevelsFinal = final
    ? final.reachability
        .filter((entry) => entry.reachable === false)
        .map((entry) => entry.level)
    : [];

  return {
    intermediateLockout: sawIntermediateLockout,
    finalLockout,
    firstLockingStepIndex,
    lockedLevelsFinal,
    recoveredFinal: sawIntermediateLockout && !finalLockout
  };
}
