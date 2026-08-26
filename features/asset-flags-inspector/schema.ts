import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type { AssetFlagsInspectorErrorCode, AssetFlagsInspectorInput } from "@/features/asset-flags-inspector/types";

/** Parses raw form input into a validated request, without throwing. */
export function parseAssetFlagsInspectorInput(raw: string): Result<AssetFlagsInspectorInput, AssetFlagsInspectorErrorCode> {
  const value = normalizeInput(raw);
  if (!value) return err("empty_input");
  return ok({ value });
}
