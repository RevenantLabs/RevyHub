import type {
  InnerIdentityComparison,
  InnerIdentityReason
} from "@/features/fee-bump-replacement-comparator/types";

/**
 * Compares two inner transactions by both network-aware hash and
 * signature-free payload.
 *
 * An equivalent-inner verdict requires both checks. Matching payloads alone
 * are incomplete evidence under a different network context, and matching
 * hashes alone would hide a decoder bug that disagreed with the wire bytes.
 * Either mismatch refuses the verdict.
 */
export function compareInnerIdentity(
  leftInnerHash: string,
  rightInnerHash: string,
  leftInnerPayloadXdr: string,
  rightInnerPayloadXdr: string
): InnerIdentityComparison {
  const hashesMatch = leftInnerHash === rightInnerHash;
  const payloadsMatch = leftInnerPayloadXdr === rightInnerPayloadXdr;

  let reason: InnerIdentityReason;
  if (hashesMatch && payloadsMatch) reason = "equivalent";
  else if (!hashesMatch && !payloadsMatch) reason = "hash_and_payload_mismatch";
  else if (!hashesMatch) reason = "hash_mismatch";
  else reason = "payload_mismatch";

  return {
    leftInnerHash,
    rightInnerHash,
    leftInnerPayloadXdr,
    rightInnerPayloadXdr,
    hashesMatch,
    payloadsMatch,
    equivalent: hashesMatch && payloadsMatch,
    reason
  };
}

/**
 * Refuses an equivalent claim unless both the selected-network hashes and the
 * signature-free payloads agree. Used by the composer so a UI path cannot
 * promote a partial match into a replacement candidate.
 */
export function isEquivalentInner(comparison: InnerIdentityComparison): boolean {
  return comparison.equivalent && comparison.hashesMatch && comparison.payloadsMatch;
}
