import { ok, type Result } from "@/core/result/result";
import { decodeDecoratedSignatures } from "@/features/signature-hint-auditor/lib/decorated-signatures";
import {
  buildGroupReports,
  countCollisions,
  countUnmatched,
  groupsForVariant
} from "@/features/signature-hint-auditor/lib/hint-candidates";
import { deriveSignerHints } from "@/features/signature-hint-auditor/lib/signer-hints";
import type {
  SignatureHintAuditorErrorCode,
  SignatureHintAuditorInput,
  SignatureHintAuditorResult
} from "@/features/signature-hint-auditor/types";

/**
 * Audits decorated signature hints in-process.
 *
 * No network request is made, input is never persisted, and a hint match is
 * never promoted to a verified signature.
 */
export function auditSignatureHints({
  envelope,
  publicSigners
}: SignatureHintAuditorInput): Result<
  SignatureHintAuditorResult,
  SignatureHintAuditorErrorCode
> {
  const decoded = decodeDecoratedSignatures(envelope);
  if (!decoded.ok) return decoded;

  const signers = deriveSignerHints(publicSigners);
  if (!signers.ok) return signers;

  const groups = buildGroupReports(
    decoded.value.entries,
    signers.value,
    groupsForVariant(decoded.value.variant)
  );
  const flat = groups.flatMap((group) => group.signatures);

  return ok({
    variant: decoded.value.variant,
    groups,
    providedSigners: signers.value,
    collisionCount: countCollisions(flat),
    unmatchedCount: countUnmatched(flat),
    signatureCount: flat.length
  });
}
