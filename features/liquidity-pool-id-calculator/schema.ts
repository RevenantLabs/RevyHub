import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { validateFeeBps } from "./lib/fee-bounds";
import type { AssetSpec, ErrorCode, ParsedInput, RawInput } from "./types";

const SECRET_PREFIX = /^S/;
const ASSET_CODE = /^[A-Za-z0-9]{1,12}$/;
const NATIVE_CODES = new Set(["", "xlm", "native"]);

function parseAsset(code: string, issuer: string): Result<AssetSpec, ErrorCode> {
  const trimmedCode = code.trim();
  const trimmedIssuer = issuer.trim();

  if (NATIVE_CODES.has(trimmedCode.toLowerCase()) && !trimmedIssuer) {
    return ok({ isNative: true, code: "native", issuer: null, display: "native" });
  }

  if (!ASSET_CODE.test(trimmedCode)) return err("invalid_asset");
  if (SECRET_PREFIX.test(trimmedIssuer) || !StrKey.isValidEd25519PublicKey(trimmedIssuer)) return err("invalid_asset");

  return ok({ isNative: false, code: trimmedCode, issuer: trimmedIssuer, display: `${trimmedCode}:${trimmedIssuer}` });
}

/** Validates both assets and the pool fee before any computation. */
export function parseInput(raw: RawInput): Result<ParsedInput, ErrorCode> {
  const assetX = parseAsset(raw.assetXCode ?? "", raw.assetXIssuer ?? "");
  if (!assetX.ok) return assetX;

  const assetY = parseAsset(raw.assetYCode ?? "", raw.assetYIssuer ?? "");
  if (!assetY.ok) return assetY;

  const feeBps = validateFeeBps((raw.feeBps ?? "").trim());
  if (!feeBps.ok) return feeBps;

  return ok({ assetX: assetX.value, assetY: assetY.value, feeBps: feeBps.value });
}
