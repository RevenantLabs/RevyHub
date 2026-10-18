import type { StellarNetwork } from "@/core/network/types";

export interface AccountActivityRollupInput { accountId: string }
export interface ActivityOperation { pagingToken: string; type: string; createdAt: string }
export interface ActivityGroup { key: string; count: number }
export interface CoverageWindow { newestDay: string | null; oldestDay: string | null; pages: number; records: number; hasMore: boolean }
export interface AccountActivityRollupResult {
  accountId: string;
  network: StellarNetwork;
  operations: ActivityOperation[];
  byType: ActivityGroup[];
  byDay: ActivityGroup[];
  coverage: CoverageWindow;
  cursor: string | null;
}
export type AccountActivityRollupErrorCode = "invalid_account" | "account_not_found" | "history_unavailable" | "invalid_cursor" | "rate_limited" | "request_failed";
export type AccountActivityRollupState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: AccountActivityRollupResult; paging: boolean; pageError: AccountActivityRollupErrorCode | null }
  | { status: "error"; code: AccountActivityRollupErrorCode };
