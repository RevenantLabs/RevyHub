export type ErrorCode = "invalid_input" | "malformed_data" | "unsupported_variant" | "too_large";
export type Verdict = "true" | "false" | "unknown";
export type Predicate =
  | { kind: "unconditional" }
  | { kind: "abs_before"; seconds: bigint }
  | { kind: "rel_before"; seconds: bigint }
  | { kind: "not"; child: Predicate }
  | { kind: "and" | "or"; children: [Predicate, Predicate] };
export interface DecisionNode {
  kind: Predicate["kind"];
  verdict: Verdict;
  detail: string;
  children?: DecisionNode[];
}
export interface EvaluatorInput {
  source: "balance_json" | "predicate_xdr";
  text: string;
  claimant: string;
  evaluationSeconds: bigint;
  evaluationTime: string;
  creationSeconds: bigint | null;
  creationTime: string | null;
}
export interface EvaluatorResult {
  source: EvaluatorInput["source"];
  claimant: string;
  evaluationTime: string;
  evaluationSource: "user_supplied";
  creationTime: string | null;
  creationSource: "user_supplied" | "unavailable";
  verdict: Verdict;
  evidence: "complete" | "incomplete";
  tree: DecisionNode | null;
  balanceId: string | null;
  amount: string | null;
  asset: string | null;
  sponsor: string | null;
  claimantCount: number | null;
  limitation: "missing_creation" | "claimant_not_listed" | null;
}
