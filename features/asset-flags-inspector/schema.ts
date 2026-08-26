import { StrKey } from "@stellar/stellar-sdk";
import { normalizeInput } from "@/core/lib/strings";
import { err, ok, type Result } from "@/core/result/result";
import type {
  AssetFlagsInspectorErrorCode,
  AssetFlagsInspectorInput,
} from "@/features/asset-flags-inspector/types";

/** Parses raw form input into a validated request, without throwing. */
export function parseAssetFlagsInspectorInput(
  raw: string
): Result<AssetFlagsInspectorInput, AssetFlagsInspectorErrorCode> {
  const accountId = normalizeInput(raw);
  if (!accountId) return err("empty_input");
  if (!StrKey.isValidEd25519PublicKey(accountId)) return err("invalid_address");

  return ok({ accountId });
}
