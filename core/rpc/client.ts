import { DEFAULT_NETWORK, SOROBAN_RPC_URLS } from "@/core/network/config";
import type { StellarNetwork } from "@/core/network/types";

export interface JsonRpcSuccess<T> {
  jsonrpc: "2.0";
  id: number | string;
  result: T;
}

export interface JsonRpcFailure {
  jsonrpc: "2.0";
  id: number | string;
  error: { code: number; message: string; data?: unknown };
}

export type JsonRpcResponse<T> = JsonRpcSuccess<T> | JsonRpcFailure;

let requestId = 0;

/**
 * Minimal JSON-RPC caller for Soroban RPC.
 *
 * Feature slices wrap this with their own typed method helpers rather than
 * calling it directly from components.
 */
export async function sorobanRpc<T>(
  method: string,
  params: unknown = {},
  options: { network?: StellarNetwork; signal?: AbortSignal } = {}
): Promise<JsonRpcResponse<T>> {
  const network = options.network ?? DEFAULT_NETWORK;
  requestId += 1;

  const response = await fetch(SOROBAN_RPC_URLS[network], {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: requestId, method, params }),
    signal: options.signal
  });

  if (!response.ok) {
    throw Object.assign(new Error(`Soroban RPC responded with ${response.status}`), {
      status: response.status
    });
  }

  return (await response.json()) as JsonRpcResponse<T>;
}

export function isRpcFailure<T>(value: JsonRpcResponse<T>): value is JsonRpcFailure {
  return "error" in value;
}
