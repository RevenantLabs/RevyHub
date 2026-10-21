import { err, ok, type Result } from "@/core/result/result";
import {
  toSep24TransactionStatusTrackerErrorCode,
  type Sep24FetchErrorCode
} from "@/features/sep24-transaction-status-tracker/lib/sep24TransactionStatusTracker.errors";
import type { Sep24Kind } from "@/features/sep24-transaction-status-tracker/types";

export interface Sep24TransactionRecord {
  id: string;
  kind: Sep24Kind;
  status: string;
  amountIn: string | null;
  amountOut: string | null;
  amountFee: string | null;
  moreInfoUrl: string | null;
}

export async function fetchSep24Transaction(
  transferServer: string,
  transactionId: string,
  token: string,
  fetchImpl: typeof fetch = globalThis.fetch,
  signal?: AbortSignal
): Promise<Result<Sep24TransactionRecord, Sep24FetchErrorCode>> {
  let response: Response;
  try {
    response = await fetchImpl(`${transferServer}/transactions/${encodeURIComponent(transactionId)}`, {
      signal,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      }
    });
  } catch {
    return err("request_failed");
  }

  if (!response.ok) return err(toSep24TransactionStatusTrackerErrorCode(response.status));

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return err("request_failed");
  }

  const transaction = isRecord(body) && isRecord(body.transaction) ? body.transaction : isRecord(body) ? body : null;
  if (!transaction || typeof transaction.status !== "string" || transaction.status.length === 0) {
    return err("request_failed");
  }

  const kind = transaction.kind === "deposit" || transaction.kind === "withdrawal" ? transaction.kind : "unknown";
  return ok({
    id: typeof transaction.id === "string" ? transaction.id : transactionId,
    kind,
    status: transaction.status,
    amountIn: stringOrNull(transaction.amount_in),
    amountOut: stringOrNull(transaction.amount_out),
    amountFee: stringOrNull(transaction.amount_fee),
    moreInfoUrl: stringOrNull(transaction.more_info_url)
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}
