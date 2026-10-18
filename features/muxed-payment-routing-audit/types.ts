import type { StellarNetwork } from "@/core/network/types";

export interface MuxedPaymentRoutingAuditInput { accountId: string }
export type MuxedPaymentRoutingAuditErrorCode = "invalid_account" | "account_not_found" | "invalid_cursor" | "malformed_payment" | "rate_limited" | "request_failed";
export interface RoutedPayment {
  pagingToken: string;
  createdAt: string;
  transactionHash: string;
  destinationId: string | null;
  amount: string;
  assetCode: string;
  assetIssuer: string | null;
}
export interface AssetTotal { assetCode: string; assetIssuer: string | null; amount: string }
export interface RoutingGroup { destinationId: string | null; payments: RoutedPayment[]; totals: AssetTotal[] }
export interface MuxedPaymentRoutingAuditResult {
  accountId: string;
  network: StellarNetwork;
  pagesFetched: number;
  pageLimit: number;
  hasMore: boolean;
  scannedOperations: number;
  groups: RoutingGroup[];
}
export type MuxedPaymentRoutingAuditState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: MuxedPaymentRoutingAuditResult }
  | { status: "error"; code: MuxedPaymentRoutingAuditErrorCode };
