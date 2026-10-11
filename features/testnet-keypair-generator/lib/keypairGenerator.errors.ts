import type { KeypairErrorCode } from "@/features/testnet-keypair-generator/types";

export interface KeypairError {
  code: KeypairErrorCode;
}

export function isKeypairError(e: unknown): e is KeypairError {
  return typeof e === "object" && e !== null && "code" in e;
}
