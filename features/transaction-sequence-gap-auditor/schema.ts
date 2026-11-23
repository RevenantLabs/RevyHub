import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  AuditorInput,
  ErrorCode,
  RawAuditorForm
} from "@/features/transaction-sequence-gap-auditor/types";

export function parseAuditorInput(raw: RawAuditorForm): Result<AuditorInput, ErrorCode> {
  const accountId = raw.accountId.trim();
  if (!accountId || accountId.startsWith("S")) return err("invalid_input");
  if (accountId.startsWith("M") || accountId.startsWith("C")) {
    return err("unsupported_variant");
  }
  if (!StrKey.isValidEd25519PublicKey(accountId)) {
    return !accountId.startsWith("G") && /^[A-Z][A-Z2-7]+$/.test(accountId)
      ? err("unsupported_variant")
      : err("invalid_input");
  }
  return ok({ accountId });
}

export const parseTransactionSequenceGapAuditorInput = parseAuditorInput;
