import { Asset, StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { buildCanonicalAssetString } from "@/features/asset-identity-validator/lib/canonical-asset-string";
import { validateCodeCharacters } from "@/features/asset-identity-validator/lib/code-characters";
import { classifyCodeLength } from "@/features/asset-identity-validator/lib/code-length-tier";
import {
  isSecretSeed,
  toAssetIdentityErrorCode
} from "@/features/asset-identity-validator/lib/assetIdentityValidator.errors";
import type {
  AssetIdentity,
  AssetIdentityErrorCode,
  AssetIdentityInput,
  CodeTier
} from "@/features/asset-identity-validator/types";

/** Reserved native code. It is valid as a length and alphabet, and invalid with an issuer. */
export const RESERVED_NATIVE_CODE = "XLM";

const SDK_TIER: Record<CodeTier, "credit_alphanum4" | "credit_alphanum12"> = {
  alphanum4: "credit_alphanum4",
  alphanum12: "credit_alphanum12"
};

/**
 * Lets the hook paint its loading state before a local result replaces it.
 * The wait is a single event-loop turn, not a timed pause.
 */
function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function confirmWithSdk(
  code: string,
  issuer: string,
  tier: CodeTier
): Result<AssetIdentity, AssetIdentityErrorCode> {
  let asset: Asset;

  try {
    asset = new Asset(code, issuer);
  } catch (error) {
    return err(toAssetIdentityErrorCode(error));
  }

  if (asset.isNative() || asset.getAssetType() !== SDK_TIER[tier]) {
    return err("invalid_code_length");
  }

  const sdkCode = asset.getCode();
  const sdkIssuer = asset.getIssuer();
  const canonical = buildCanonicalAssetString(sdkCode, sdkIssuer);

  if (!canonical.ok) return canonical;
  if (canonical.value !== asset.toString()) return err("invalid_issuer");

  return ok({
    code: sdkCode,
    issuer: sdkIssuer,
    tier,
    length: sdkCode.length,
    canonical: canonical.value
  });
}

/**
 * Validates a classic asset identity offline.
 *
 * Order is fixed: secret seeds are dropped before any other rule, then length,
 * then characters, then the reserved native code, then the public-key check.
 * The SDK `Asset` constructor confirms the success path only.
 */
export function validateAssetIdentity(
  input: AssetIdentityInput
): Result<AssetIdentity, AssetIdentityErrorCode> {
  const issuer = input.issuer.replace(/\s+/g, "");

  if (isSecretSeed(issuer)) return err("invalid_issuer");

  const code = input.code.trim();
  const length = classifyCodeLength(code);
  if (!length.ok) return length;

  const characters = validateCodeCharacters(code);
  if (!characters.ok) return characters;

  if (code === RESERVED_NATIVE_CODE && issuer.length > 0) {
    return err("reserved_native_conflict");
  }

  if (!StrKey.isValidEd25519PublicKey(issuer)) return err("invalid_issuer");

  return confirmWithSdk(code, issuer, length.value.tier);
}

/** Async entry used by the hook so idle, loading, success and error all occur. */
export async function runAssetIdentityValidator(
  input: AssetIdentityInput
): Promise<Result<AssetIdentity, AssetIdentityErrorCode>> {
  await yieldToEventLoop();
  return validateAssetIdentity(input);
}
