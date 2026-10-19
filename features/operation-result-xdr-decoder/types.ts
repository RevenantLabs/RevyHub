import type { StellarNetwork } from "@/core/network/types";

export interface OperationResultXdrDecoderInput { hash: string }
export type OperationResultXdrDecoderErrorCode = "invalid_hash" | "transaction_not_found" | "malformed_result_xdr" | "unsupported_operation" | "rate_limited" | "request_failed";
export interface DecodedOperation { index: number; type: string; code: string; outerCode: string }
export interface DecodedResult { outerCode: string; transactionCode: string; feeCharged: string; innerFeeCharged: string | null; feeBump: boolean; operations: DecodedOperation[] }
export interface ExplainedCode { code: string; title: string; explanation: string }
export interface OperationResultRow { index: number; type: string; result: ExplainedCode; outerCode: string }
export interface OperationResultXdrDecoderResult {
  hash: string;
  network: StellarNetwork;
  verdict: "success" | "operation_failure" | "pre_operation_failure";
  outer: ExplainedCode;
  transaction: ExplainedCode;
  feeCharged: string;
  innerFeeCharged: string | null;
  feeBump: boolean;
  operations: OperationResultRow[];
}
