import { copy } from "@/features/asset-identity-validator/copy";
import type { CodeTier } from "@/features/asset-identity-validator/types";

/** Tier label shown on the result badge. The words live in `copy.ts`. */
export function formatTier(tier: CodeTier): string {
  return tier === "alphanum4" ? copy.tierAlphanum4 : copy.tierAlphanum12;
}

/** Exact length line, including the singular character case. */
export function formatCodeLength(length: number): string {
  const noun = length === 1 ? copy.lengthSingular : copy.lengthPlural;
  return `${length} ${noun}`;
}

/**
 * Presentation form of a canonical asset string.
 * The builder already produced `code:issuer`; this does not add spaces or a prefix.
 */
export function formatCanonicalAssetString(canonical: string): string {
  return canonical;
}
