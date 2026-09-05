export type PredicateNode =
  | { type: "unconditional" }
  | { type: "abs_before"; timestamp: number }
  | { type: "abs_after"; timestamp: number }
  | { type: "rel_before"; seconds: number }
  | { type: "rel_after"; seconds: number }
  | { type: "not"; child: PredicateNode }
  | { type: "and"; children: [PredicateNode, PredicateNode] }
  | { type: "or"; children: [PredicateNode, PredicateNode] };

export interface ClaimablePredicateBuilderInput {
  /** Validated predicate tree from the user. */
  predicate: PredicateNode;
}

export interface ClaimTimelineEntry {
  /** Start of an interval when the predicate is true (inclusive), in milliseconds. */
  from: number;
  /** End of an interval when the predicate is true (inclusive). `null` means unbounded. */
  to: number | null;
}

export interface ClaimablePredicateBuilderResult {
  /** Plain-language description of the predicate. */
  description: string;
  /** Base64-encoded XDR of the Stellar ClaimPredicate. */
  xdr: string;
  /** Claimability intervals relative to the balance creation time. */
  timeline: ClaimTimelineEntry[];
  /** True if the predicate can never be satisfied. */
  unsatisfiable: boolean;
}

export type ClaimablePredicateBuilderErrorCode =
  | "empty_input"
  | "invalid_input"
  | "invalid_time_bound"
  | "too_deeply_nested"
  | "unsatisfiable"
  | "encoding_failed";
