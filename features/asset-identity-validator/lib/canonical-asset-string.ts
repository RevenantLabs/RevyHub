import { err, ok, type Result } from "@/core/result/result";
import { isSecretSeed } from "@/features/asset-identity-validator/lib/assetIdentityValidator.errors";

/** Separator used by classic `code:issuer` asset strings. */
export const CANONICAL_SEPARATOR = ":";

/**
 * Builds `code:issuer`.
 *
 * A secret seed is refused here as well, so a caller cannot assemble a
 * canonical string that echoes it back.
 */
export function buildCanonicalAssetString(
  code: string,
  issuer: string
): Result<string, "empty_code" | "invalid_issuer"> {
  if (!code) return err("empty_code");
  if (!issuer || isSecretSeed(issuer)) return err("invalid_issuer");

  return ok(`${code}${CANONICAL_SEPARATOR}${issuer}`);
}
