import type { ErrorCode } from "../types";

interface RpcError {
  code?: number;
  message?: string;
}

export function mapRpcFailure(error: RpcError): { ok: false; code: ErrorCode } {
  const message = (error.message ?? "").toLowerCase();
  if (error.code === 429 || message.includes("rate")) return { ok: false, code: "rate_limited" };
  if (message.includes("ledger") || message.includes("history") || message.includes("retention")) {
    return { ok: false, code: "history_unavailable" };
  }
  return { ok: false, code: "request_failed" };
}

export function mapTransport(error: unknown): ErrorCode {
  const status = typeof error === "object" && error && "status" in error ? Number((error as { status: number }).status) : 0;
  if (status === 429) return "rate_limited";
  return "request_failed";
}

export function unexpectedFailure(): ErrorCode {
  return "request_failed";
}
