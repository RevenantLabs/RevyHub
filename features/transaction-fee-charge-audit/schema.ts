import { err, ok, type Result } from "@/core/result/result";
import type {
  TransactionFeeChargeAuditErrorCode,
  TransactionFeeChargeAuditInput
} from "@/features/transaction-fee-charge-audit/types";

/** A Stellar transaction hash is 32 bytes rendered as 64 hex characters. */
const HASH = /^[a-fA-F0-9]{64}$/;

export function isLikelyTransactionHash(value: string): boolean {
  return HASH.test(value);
}

/** Parses raw form input into a validated request, without throwing. */
export function parseTransactionFeeChargeAuditInput(
  raw: string
): Result<TransactionFeeChargeAuditInput, TransactionFeeChargeAuditErrorCode> {
  const hash = raw.replace(/\s+/g, "");

  if (!hash) return err("empty_input");
  if (!HASH.test(hash)) return err("invalid_hash");

  return ok({ hash: hash.toLowerCase() });
}
