import { err, type Result } from "@/core/result/result";
import type { ErrorCode } from "../types";

interface RpcError {
  code?: number;
  message?: string;
}

/** Maps a JSON-RPC error payload onto this tool's own error codes. */
export function mapRpcFailure(error: RpcError): Result<never, ErrorCode> {
  const message = (error.message ?? "").toLowerCase();
  if (message.includes("history") || message.includes("not available") || message.includes("pruned")) {
    return err("history_unavailable");
  }
  return err("request_failed");
}

/** Maps a transport-level failure (network error, non-2xx response) onto an error code. */
export function mapTransport(error: unknown): ErrorCode {
  const status = (error as { status?: number } | undefined)?.status;
  if (status === 429) return "rate_limited";
  return "request_failed";
}

export function unexpectedFailure(): ErrorCode {
  return "request_failed";
}
