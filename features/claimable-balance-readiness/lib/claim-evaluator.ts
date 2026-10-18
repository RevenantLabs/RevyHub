import type {
  BranchOutcome,
  PredicateTreeNode,
  ReadinessVerdictKind
} from "@/features/claimable-balance-readiness/types";
import {
  describeNormalizedPredicate,
  formatRelativeSeconds,
  type NormalizedPredicate
} from "@/features/claimable-balance-readiness/lib/predicate-tree";
import type { EvaluationTimeContext } from "@/features/claimable-balance-readiness/lib/time-context";

function formatUtc(ms: number): string {
  return new Date(ms).toISOString().replace("T", " ").replace(".000Z", " UTC");
}

function combineAnd(left: BranchOutcome, right: BranchOutcome): BranchOutcome {
  if (left === "unsatisfied" || right === "unsatisfied") return "unsatisfied";
  if (left === "indeterminate" || right === "indeterminate") return "indeterminate";
  return "satisfied";
}

function combineOr(left: BranchOutcome, right: BranchOutcome): BranchOutcome {
  if (left === "satisfied" || right === "satisfied") return "satisfied";
  if (left === "indeterminate" || right === "indeterminate") return "indeterminate";
  return "unsatisfied";
}

function negate(outcome: BranchOutcome): BranchOutcome {
  if (outcome === "satisfied") return "unsatisfied";
  if (outcome === "unsatisfied") return "satisfied";
  return "indeterminate";
}

/** Evaluate a normalized predicate tree at the selected time context. */
export function evaluatePredicate(
  node: NormalizedPredicate,
  context: EvaluationTimeContext
): PredicateTreeNode {
  const label = describeNormalizedPredicate(node);

  switch (node.kind) {
    case "unconditional":
      return {
        kind: "unconditional",
        label,
        outcome: "satisfied",
        explanation: "Unconditional predicates are always claimable."
      };

    case "abs_before": {
      const satisfied = context.evaluationMs < node.boundMs;
      return {
        kind: "abs_before",
        label,
        outcome: satisfied ? "satisfied" : "unsatisfied",
        explanation: satisfied
          ? `Evaluation time ${formatUtc(context.evaluationMs)} is before ${formatUtc(node.boundMs)}.`
          : `Evaluation time ${formatUtc(context.evaluationMs)} is not before ${formatUtc(node.boundMs)}.`
      };
    }

    case "abs_after": {
      const satisfied = context.evaluationMs >= node.boundMs;
      return {
        kind: "abs_after",
        label,
        outcome: satisfied ? "satisfied" : "unsatisfied",
        explanation: satisfied
          ? `Evaluation time ${formatUtc(context.evaluationMs)} is on or after ${formatUtc(node.boundMs)}.`
          : `Evaluation time ${formatUtc(context.evaluationMs)} is before ${formatUtc(node.boundMs)}.`
      };
    }

    case "rel_before": {
      if (!context.creationReliable || context.creationMs === null) {
        return {
          kind: "rel_before",
          label,
          outcome: "indeterminate",
          explanation:
            "Relative-before predicates need a reliable balance creation timestamp; Horizon did not provide one that can be trusted."
        };
      }
      const deadline = context.creationMs + node.seconds * 1000;
      const satisfied = context.evaluationMs < deadline;
      return {
        kind: "rel_before",
        label,
        outcome: satisfied ? "satisfied" : "unsatisfied",
        explanation: satisfied
          ? `Within ${formatRelativeSeconds(node.seconds)} of creation (${formatUtc(context.creationMs)}); evaluation is ${formatUtc(context.evaluationMs)}.`
          : `More than ${formatRelativeSeconds(node.seconds)} after creation (${formatUtc(context.creationMs)}); evaluation is ${formatUtc(context.evaluationMs)}.`
      };
    }

    case "rel_after": {
      if (!context.creationReliable || context.creationMs === null) {
        return {
          kind: "rel_after",
          label,
          outcome: "indeterminate",
          explanation:
            "Relative-after predicates need a reliable balance creation timestamp; Horizon did not provide one that can be trusted."
        };
      }
      const unlock = context.creationMs + node.seconds * 1000;
      const satisfied = context.evaluationMs >= unlock;
      return {
        kind: "rel_after",
        label,
        outcome: satisfied ? "satisfied" : "unsatisfied",
        explanation: satisfied
          ? `At least ${formatRelativeSeconds(node.seconds)} after creation (${formatUtc(context.creationMs)}); evaluation is ${formatUtc(context.evaluationMs)}.`
          : `Less than ${formatRelativeSeconds(node.seconds)} after creation (${formatUtc(context.creationMs)}); evaluation is ${formatUtc(context.evaluationMs)}.`
      };
    }

    case "and": {
      const left = evaluatePredicate(node.children[0], context);
      const right = evaluatePredicate(node.children[1], context);
      const outcome = combineAnd(left.outcome, right.outcome);
      return {
        kind: "and",
        label,
        outcome,
        explanation:
          outcome === "satisfied"
            ? "Both AND branches are satisfied."
            : outcome === "unsatisfied"
              ? "At least one AND branch is not satisfied."
              : "AND cannot be decided because at least one branch is indeterminate.",
        children: [left, right]
      };
    }

    case "or": {
      const left = evaluatePredicate(node.children[0], context);
      const right = evaluatePredicate(node.children[1], context);
      const outcome = combineOr(left.outcome, right.outcome);
      return {
        kind: "or",
        label,
        outcome,
        explanation:
          outcome === "satisfied"
            ? "At least one OR branch is satisfied."
            : outcome === "unsatisfied"
              ? "Neither OR branch is satisfied."
              : "OR cannot be decided because no branch is satisfied and at least one is indeterminate.",
        children: [left, right]
      };
    }

    case "not": {
      const child = evaluatePredicate(node.child, context);
      const outcome = negate(child.outcome);
      return {
        kind: "not",
        label,
        outcome,
        explanation:
          outcome === "indeterminate"
            ? "NOT of an indeterminate branch stays indeterminate."
            : outcome === "satisfied"
              ? "The inner branch is not satisfied, so NOT is satisfied."
              : "The inner branch is satisfied, so NOT is not satisfied.",
        children: [child]
      };
    }
  }
}

export function outcomeToVerdict(outcome: BranchOutcome): ReadinessVerdictKind {
  if (outcome === "satisfied") return "eligible";
  if (outcome === "unsatisfied") return "ineligible";
  return "indeterminate";
}
