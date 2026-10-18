import { err, ok, type Result } from "@/core/result/result";
import type {
  TransactionErrorCode,
  TransactionInput
} from "@/features/transaction-lookup/types";

/** A Stellar transaction hash is 32 bytes rendered as 64 hex characters. */
const HASH = /^[a-fA-F0-9]{64}$/;

export function isLikelyTransactionHash(value: string): boolean {
  return HASH.test(value);
}

export function parseTransactionInput(
  raw: string
): Result<TransactionInput, TransactionErrorCode> {
  const hash = raw.replace(/\s+/g, "");

  if (!hash) return err("empty_input");
  if (!HASH.test(hash)) return err("invalid_hash");

  // Horizon treats the hash case-insensitively but returns lowercase; normalise
  // so the value shown back always matches the ledger's own rendering.
  return ok({ hash: hash.toLowerCase() });
}
