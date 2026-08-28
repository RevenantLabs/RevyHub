import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { SequenceInspectorErrorCode, SequenceInspectorInput } from "@/features/sequence-inspector/types";

export const INT64_MAX = 9_223_372_036_854_775_807n;
const UNSIGNED_DECIMAL = /^[0-9]+$/;

export interface RawSequenceInspectorInput {
  accountId: string;
  bumpTarget?: string;
}

export function parseSequenceInspectorInput(
  raw: RawSequenceInspectorInput
): Result<SequenceInspectorInput, SequenceInspectorErrorCode> {
  const accountId = raw.accountId.trim();
  const bumpTarget = raw.bumpTarget?.trim() ?? "";

  if (!accountId) return err("empty_input");
  if (accountId.startsWith("S") || !StrKey.isValidEd25519PublicKey(accountId)) {
    return err("invalid_address");
  }

  if (bumpTarget) {
    if (bumpTarget.length > INT64_MAX.toString().length || !UNSIGNED_DECIMAL.test(bumpTarget)) {
      return err("invalid_bump_target");
    }
    const target = BigInt(bumpTarget);
    if (target <= 0n || target > INT64_MAX) return err("invalid_bump_target");
  }

  return ok({ accountId, ...(bumpTarget ? { bumpTarget } : {}) });
}
