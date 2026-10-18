export type SizeErrorCode =
  | "empty_input"
  | "invalid_input"
  | "input_too_large"
  | "invalid_xdr"
  | "invalid_budget";

export type EnvelopeKind = "classic-v0" | "classic-v1" | "fee-bump";

/**
 * One additive slice of a layer's serialized bytes.
 *
 * Every section a layer reports must sum to that layer's `totalBytes`. The key
 * is an identifier, never English — `copy.ts` maps it to a label.
 */
export type SectionKey =
  | "envelope_discriminant"
  | "fee_bump_body"
  | "inner_envelope"
  | "inner_discriminant"
  | "transaction_body"
  | "operations"
  | "signatures";

export interface SizeSection {
  key: SectionKey;
  bytes: number;
}

export interface LayerBreakdown {
  /** Serialized size of this layer, measured with the XDR encoder. */
  totalBytes: number;
  /** Additive sections; empty when the variant could not be split safely. */
  sections: SizeSection[];
  operationCount: number;
  signatureCount: number;
  /** Serialized bytes per operation, in envelope order. */
  operationBytes: number[];
  /** Serialized bytes per decorated signature, in envelope order. */
  signatureBytes: number[];
}

export interface BudgetAssessment {
  budgetBytes: number;
  withinBudget: boolean;
  /** Bytes left when within budget, otherwise 0. */
  headroomBytes: number;
  /** Bytes over when past budget, otherwise 0. */
  overageBytes: number;
}

export interface SizeReport {
  kind: EnvelopeKind;
  /** Real XDR bytes — what the network actually carries. */
  totalBytes: number;
  /** Length of the re-encoded base64, with no whitespace. */
  normalizedBase64Length: number;
  /** Length of the base64 as pasted, after whitespace is stripped. */
  pastedBase64Length: number;
  outer: LayerBreakdown;
  /** Present only for fee-bump envelopes. */
  inner: LayerBreakdown | null;
  budget: BudgetAssessment | null;
  /**
   * False when the sections could not be proven to sum to the total, in which
   * case only measured totals are shown.
   */
  breakdownComplete: boolean;
}

export interface SizeInput {
  envelope: string;
  /** Absent when the user left the optional budget blank. */
  budgetBytes: number | null;
}
