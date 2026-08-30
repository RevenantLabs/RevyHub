export type ResultCodeExplainerMode = "code" | "xdr";

export interface ResultCodeExplainerInput {
  mode: ResultCodeExplainerMode;
  value: string;
  search?: string;
}

export type ResultCodeCategory = "transaction" | "operation";

export interface CodeExplanation {
  code: string;
  category: ResultCodeCategory;
  /** Present when the code is specific to one operation type. */
  operationType?: string;
  title: string;
  cause: string;
  fix: string;
  known: boolean;
}

export interface OperationResultSummary {
  index: number;
  operationType: string | null;
  outerCode: string;
  innerCode: string | null;
  explanations: CodeExplanation[];
}

export interface ResultCodeExplainerResult {
  mode: ResultCodeExplainerMode;
  feeCharged: string | null;
  transactionCode: string | null;
  transactionExplanation: CodeExplanation | null;
  operations: OperationResultSummary[];
  /** Flat list of every explanation shown, for search filtering. */
  explanations: CodeExplanation[];
  searchQuery: string;
  unknownCodes: string[];
}

export type ResultCodeExplainerErrorCode =
  | "empty_input"
  | "invalid_base64"
  | "input_too_large"
  | "invalid_xdr"
  | "unknown_code";
