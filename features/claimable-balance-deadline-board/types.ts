export interface DeadlineBoardInput { claimant: string; cursor?: string }
export type DeadlineBoardErrorCode = "invalid_claimant" | "invalid_cursor" | "malformed_predicate" | "history_unavailable" | "rate_limited" | "request_failed";
export type PredicateNode =
  | { kind: "unconditional" }
  | { kind: "and" | "or"; children: [PredicateNode, PredicateNode] }
  | { kind: "not"; child: PredicateNode }
  | { kind: "abs_before" | "abs_after" | "rel_before" | "rel_after"; value: string; instant?: string };
export interface DeadlineRow {
  id: string;
  amount: string;
  asset: string;
  pagingToken: string;
  predicate: PredicateNode;
  deadline?: string;
  deadlineKind?: "absolute" | "relative";
  conditionPassed?: boolean;
}
export interface DeadlineBoardResult {
  claimant: string;
  pagesFetched: number;
  limitReached: boolean;
  nextCursor?: string;
  dated: DeadlineRow[];
  undated: DeadlineRow[];
}
export type DeadlineBoardState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: DeadlineBoardResult }
  | { status: "error"; code: DeadlineBoardErrorCode; field: "claimant" | "cursor" | null };
