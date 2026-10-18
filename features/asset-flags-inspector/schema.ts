import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  AssetFlagsInspectorErrorCode,
  AssetFlagsInspectorInput
} from "@/features/asset-flags-inspector/types";

/** Parses raw form input into a validated issuer address, without throwing. */
export function parseAssetFlagsInspectorInput(
  raw: string
): Result<AssetFlagsInspectorInput, AssetFlagsInspectorErrorCode> {
  const issuerId = raw.replace(/\s+/g, "");

  if (!issuerId) return err("empty_input");
  if (!StrKey.isValidEd25519PublicKey(issuerId)) return err("invalid_address");

  return ok({ issuerId });
}
