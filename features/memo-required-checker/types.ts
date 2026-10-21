import type { StellarNetwork } from "@/core/network/types";

export interface MemoRequiredCheckerInput {
  accountId: string;
}

/** A source can require a memo, explicitly decline, or publish nothing. */
export type MemoSignal = "required" | "not_required" | "absent";

export type MemoSource = "data_entry" | "stellar_toml";

export interface MemoRequiredCheckerResult {
  accountId: string;
  network: StellarNetwork;
  verdict: "required" | "not_required";
  dataEntry: MemoSignal;
  toml: MemoSignal;
  /** Sources that themselves say a memo is required. */
  sources: MemoSource[];
  /** True when the data entry requires a memo and stellar.toml says it does not. */
  conflict: boolean;
  homeDomain: string | null;
  tomlUrl: string | null;
  bestEffortNotice: string;
}

export type MemoRequiredCheckerErrorCode =
  | "invalid_account"
  | "account_not_found"
  | "malformed_data_entry"
  | "toml_unreachable"
  | "rate_limited"
  | "request_failed";

export type MemoRequiredField = "accountId";
