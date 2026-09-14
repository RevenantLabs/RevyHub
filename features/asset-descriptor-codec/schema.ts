import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type { AssetDescriptorErrorCode } from "@/features/asset-descriptor-codec/types";

export type ParsedAssetInput =
  | { mode: "native"; value: string }
  | { mode: "issued"; value: string }
  | { mode: "xdr"; value: string };

export function parseAssetDescriptorInput(
  raw: string
): Result<ParsedAssetInput, AssetDescriptorErrorCode> {
  const input = normalizeInput(raw);

  if (!input) return err("empty_input");

  // Check if it looks like XDR (long base64 string, no colons, > 20 chars)
  if (!input.includes(":") && input.length > 20) {
    return ok({ mode: "xdr", value: input });
  }

  // Check for native asset
  if (input.toUpperCase() === "XLM") {
    return ok({ mode: "native", value: input });
  }

  // Parse CODE:ISSUER format
  const colonIdx = input.indexOf(":");
  if (colonIdx === -1) {
    return err("invalid_issuer");
  }

  const code = input.slice(0, colonIdx).trim();
  const issuer = input.slice(colonIdx + 1).trim();

  if (!code || code.length > 12 || !/^[A-Za-z0-9]+$/.test(code)) {
    return err("invalid_asset_code");
  }

  if (!StrKey.isValidEd25519PublicKey(issuer)) {
    return err("invalid_issuer");
  }

  return ok({ mode: "issued", value: input });
}
