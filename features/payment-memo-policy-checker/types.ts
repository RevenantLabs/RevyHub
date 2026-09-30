export interface PaymentMemoPolicyCheckerInput {
  value: string;
}

export interface PaymentMemoPolicyCheckerResult {
  summary: string;
}

export type PaymentMemoPolicyCheckerErrorCode = "empty_input" | "invalid_input" | "not_found" | "request_failed";
