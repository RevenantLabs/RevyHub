/** HTTP failures from the SEP-24 transaction endpoint. Schema codes stay outside this set. */
export type Sep24FetchErrorCode = "unauthorized" | "transaction_not_found" | "request_failed";

export function toSep24TransactionStatusTrackerErrorCode(status: number): Sep24FetchErrorCode {
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 404) return "transaction_not_found";
  return "request_failed";
}
