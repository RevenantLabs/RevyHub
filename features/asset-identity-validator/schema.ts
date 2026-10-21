import { err, ok, type Result } from "@/core/result/result";
import { isSecretSeed } from "@/features/asset-identity-validator/lib/assetIdentityValidator.errors";
import type {
  AssetIdentityErrorCode,
  AssetIdentityInput
} from "@/features/asset-identity-validator/types";

export interface RawAssetIdentityInput {
  code: string;
  issuer: string;
}

/**
 * Normalises a pasted pair.
 *
 * A secret seed is rejected on the `S` prefix before the value can be returned
 * to the caller. Length and character rules stay in the domain module so each
 * failure keeps its own code.
 */
export function parseAssetIdentityInput(
  raw: RawAssetIdentityInput
): Result<AssetIdentityInput, AssetIdentityErrorCode> {
  const issuer = raw.issuer.replace(/\s+/g, "");

  if (isSecretSeed(issuer)) return err("invalid_issuer");

  const code = raw.code.trim();
  if (!code) return err("empty_code");

  return ok({ code, issuer });
}
