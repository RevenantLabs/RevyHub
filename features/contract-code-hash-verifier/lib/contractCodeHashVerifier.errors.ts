import { err, type Result } from "@/core/result/result";
import { isRpcFailure, sorobanRpc } from "@/core/rpc/client";
import type { StellarNetwork } from "@/core/network/types";
import type { ErrorCode, LedgerResult } from "../types";

interface RpcError {
  code?: number;
  message?: string;
}

export function mapRpcFailure(error: RpcError): Result<never, ErrorCode> {
  void error.code;
  void error.message;
  return err("request_failed");
}

export function mapTransport(error: unknown): ErrorCode {
  void error;
  return "request_failed";
}

export async function readEntries(keys: string[], network: StellarNetwork, signal?: AbortSignal): Promise<Result<LedgerResult, ErrorCode>> {
  try {
    const response = await sorobanRpc<LedgerResult>("getLedgerEntries", { keys }, { network, signal });
    if (isRpcFailure(response)) return mapRpcFailure(response.error);
    return { ok: true, value: response.result };
  } catch (error) {
    return err(mapTransport(error));
  }
}

export function unexpectedFailure(): ErrorCode {
  return "request_failed";
}
