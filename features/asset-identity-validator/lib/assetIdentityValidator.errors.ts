import type { AssetIdentityErrorCode } from "@/features/asset-identity-validator/types";

/**
 * True when the value is a secret seed.
 *
 * The prefix alone is enough. Checksum verification would decode the seed,
 * and this helper never returns the value it inspected.
 */
export function isSecretSeed(value: string): boolean {
  return value.startsWith("S") || value.startsWith("s");
}

/** Codes that describe the asset code rather than the issuer account. */
const CODE_PROBLEMS: readonly AssetIdentityErrorCode[] = [
  "empty_code",
  "invalid_code_length",
  "invalid_code_characters",
  "reserved_native_conflict"
];

export function isCodeProblem(code: AssetIdentityErrorCode): boolean {
  return CODE_PROBLEMS.includes(code);
}

export function isIssuerProblem(code: AssetIdentityErrorCode): boolean {
  return code === "invalid_issuer";
}

/**
 * Whether a failure must not be rendered with the submitted issuer.
 * The issuer argument is only a predicate input; callers must not store it
 * on the error state.
 */
export function shouldRedact(code: AssetIdentityErrorCode, issuer: string): boolean {
  return code === "invalid_issuer" && isSecretSeed(issuer.replace(/\s+/g, ""));
}

/**
 * Maps an unexpected throw from the SDK onto this slice's codes.
 *
 * The original message is not returned. SDK messages can repeat the value
 * that failed, which is exactly what a secret-seed rejection must not do.
 */
export function toAssetIdentityErrorCode(error: unknown): AssetIdentityErrorCode {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("xlm") || message.includes("native")) return "reserved_native_conflict";
  if (message.includes("issuer")) return "invalid_issuer";
  if (message.includes("code") || message.includes("alphanumeric")) return "invalid_code_characters";

  return "invalid_issuer";
}
