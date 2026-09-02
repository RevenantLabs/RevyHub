/** The internal predicate tree model - independent from UI and XDR */
export type PredicateNode =
  | { type: "unconditional" }
  | { type: "before_absolute"; timestamp: number } // Unix seconds
  | { type: "before_relative"; seconds: number }
  | { type: "and"; children: PredicateNode[] }
  | { type: "or"; children: PredicateNode[] }
  | { type: "not"; child: PredicateNode };

/** Raw form input for a single predicate node */
export interface RawPredicateForm {
  type: string;
  timestamp?: string; // ISO 8601 or empty
  seconds?: string; // Duration in seconds or empty
  children?: RawPredicateForm[];
  child?: RawPredicateForm;
}

/** Validated predicate input ready to encode */
export interface PredicateBuilderInput {
  predicate: PredicateNode;
}

/** The encoded result with XDR and preview */
export interface PredicateBuilderResult {
  predicate: PredicateNode;
  plainLanguage: string;
  xdrBase64: string;
}

export type PredicateBuilderErrorCode =
  | "empty_predicate"
  | "invalid_timestamp"
  | "invalid_duration"
  | "invalid_and_children"
  | "invalid_or_children"
  | "invalid_not_child"
  | "unsupported_type"
  | "encoding_failed";

export type PredicateBuilderField = "timestamp" | "seconds" | "children" | "child" | null;
