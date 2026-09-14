import type { NetworkErrorCode } from "@/features/network-passphrase-inspector/types";

export interface NetworkError {
  code: NetworkErrorCode;
}

export function isNetworkError(e: unknown): e is NetworkError {
  return typeof e === "object" && e !== null && "code" in e;
}
