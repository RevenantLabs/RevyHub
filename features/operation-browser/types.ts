export interface OperationBrowserInput {
  accountId: string;
}

export interface OperationParam {
  label: string;
  value: string;
}

export interface OperationSummary {
  id: string;
  pagingToken: string;
  type: string;
  sourceAccount: string;
  createdAt: string;
  transactionHash: string;
  transactionSuccessful: boolean;
  params: OperationParam[];
}

export interface OperationBrowserResult {
  accountId: string;
  /** Cached pages, newest batch first. */
  pages: OperationSummary[][];
  /** Which cached page is currently shown (0 = newest). */
  pageIndex: number;
  /** Horizon returned a full page for the oldest loaded batch. */
  hasMoreOlder: boolean;
  typeFilter: string;
}

export type OperationBrowserField = "accountId";

export type OperationBrowserErrorCode =
  | "empty_input"
  | "invalid_address"
  | "account_not_found"
  | "rate_limited"
  | "request_failed";
