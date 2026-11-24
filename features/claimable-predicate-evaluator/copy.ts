import type { ErrorCode, Verdict } from "@/features/claimable-predicate-evaluator/types";
export const copy = {
  source: "Input format", jsonOption: "Claimable balance JSON", xdrOption: "Predicate XDR (base64)",
  text: "Pasted balance or predicate", textHint: "Paste a Horizon claimable-balance JSON object or base64 ClaimPredicate XDR. Processing stays in this browser.",
  claimant: "Claimant address", claimantHint: "Enter a public G address. Secret seeds are refused.",
  evaluation: "Evaluation time (UTC)", evaluationHint: "Use YYYY-MM-DDTHH:mm:ssZ. Predicate times use whole seconds.",
  creation: "Creation time (UTC, optional)", creationHint: "Required for relative predicates. Enter the actual creation ledger close time; last_modified_time is not creation evidence.",
  evaluationExample: "2026-11-23T12:00:00Z", creationExample: "2026-11-22T12:00:00Z",
  submit: "Evaluate predicate", processing: "Evaluating locally…", reset: "Clear result",
  emptyTitle: "No evaluation yet", emptyDescription: "Paste balance JSON or predicate XDR, enter a claimant and a UTC time, then evaluate.",
  resultTitle: "Predicate evaluation", verdict: "Selected claimant", sourceLabel: "Input source", balanceId: "Balance ID", amount: "Amount", asset: "Asset", sponsor: "Sponsor", count: "Claimants in balance", evaluationLabel: "Evaluation time", creationLabel: "Creation time", absent: "Not supplied",
  userSupplied: "user supplied",
  treeTitle: "Branch decisions", incompleteTitle: "Evidence incomplete", missingCreation: "A relative branch needs the balance creation ledger close time. The result is unknown until you supply it.",
  notListed: "This claimant is not listed in the pasted balance. No eligibility assertion can be made for this address.",
  evidenceComplete: "Predicate evaluated from the supplied evidence. This does not check whether the balance still exists or whether a transaction can succeed.",
  evidenceIncomplete: "No eligible verdict is asserted while evidence is incomplete.",
  sourceNames: { balance_json: "Pasted balance JSON", predicate_xdr: "Pasted predicate XDR" },
  verdictNames: { true: "True", false: "False", unknown: "Unknown" },
  kindNames: { unconditional: "Unconditional", abs_before: "Before absolute time", rel_before: "Before relative time", not: "NOT", and: "AND", or: "OR" }
} as const;
export const branchDetail = {
  unconditional: "No time restriction.",
  absolute: (seconds: string, verdict: Verdict) => `Evaluation is ${verdict === "true" ? "before" : "at or after"} Unix second ${seconds}; before is strict.`,
  relative: (duration: string, deadline: string, verdict: Verdict) => `Creation plus ${duration} seconds is Unix second ${deadline}; evaluation is ${verdict === "true" ? "before" : "at or after"} it.`,
  missingCreation: "Creation time is unavailable, so this relative branch is unknown.",
  not: "Logical negation of the child decision.", and: "Both branches must be true.", or: "At least one branch must be true."
};
export const errorCopy: Record<ErrorCode, { title: string; description: string }> = {
  invalid_input: { title: "Check the inputs", description: "Provide a public G address, pasted data, and exact UTC times. Do not paste a secret seed." },
  malformed_data: { title: "Malformed data", description: "Check the JSON or base64 XDR. Predicates must contain exactly one valid union arm." },
  unsupported_variant: { title: "Unsupported predicate", description: "Use unconditional, before absolute/relative time, AND, OR, or NOT predicates." },
  too_large: { title: "Input exceeds limits", description: "Use a smaller balance or predicate tree. The tool limits pasted size, depth, and node count." }
};
