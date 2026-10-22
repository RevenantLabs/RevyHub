export interface BatchOperationSummaryInput { envelope: string }
export interface OperationTypeCount { type: string; count: number }
export interface BatchOperationSummaryResult {
  operationTotal: number;
  typeCounts: OperationTypeCount[];
  nativeAmountStroops: string;
  transactionSource: string;
  operationSources: string[];
}
export type BatchOperationSummaryErrorCode =
  | "empty_xdr"
  | "invalid_xdr"
  | "unsupported_operation"
  | "too_large";
