import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type { SequenceInspectorErrorCode, SequenceInspectorInput } from "@/features/sequence-inspector/types";

export function parseSequenceInspectorInput(
  rawAccountId: string,
  rawBumpTarget?: string
): Result<SequenceInspectorInput, SequenceInspectorErrorCode> {
  const accountId = normalizeInput(rawAccountId);
  
  if (!accountId) return err("empty_input");
  if (!StrKey.isValidEd25519PublicKey(accountId)) return err("invalid_address");

  const bumpTarget = normalizeInput(rawBumpTarget || "");

  if (bumpTarget) {
    // Check if it's a valid integer
    if (!/^\d+$/.test(bumpTarget)) {
      return err("invalid_bump_target");
    }
    
    // Check if it's within int64 range (max 9223372036854775807)
    try {
      const bn = BigInt(bumpTarget);
      if (bn < 0n || bn > 9223372036854775807n) {
        return err("invalid_bump_target");
      }
    } catch {
      return err("invalid_bump_target");
    }
  }

  return ok({ 
    accountId, 
    ...(bumpTarget ? { bumpTarget } : {})
  });
}
