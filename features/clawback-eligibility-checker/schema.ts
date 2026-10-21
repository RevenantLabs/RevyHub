import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { ErrorCode, ParsedInput, RawInput } from "./types";

const SECRET_PREFIX = /^S/;
const ASSET_CODE = /^[A-Za-z0-9]{1,12}$/;

function isAccountId(value: string): boolean {
  return !SECRET_PREFIX.test(value) && StrKey.isValidEd25519PublicKey(value);
}

/** Validates both account IDs and the asset code before any request. */
export function parseInput(raw: RawInput): Result<ParsedInput, ErrorCode> {
  const issuerAccountId = (raw.issuerAccountId ?? "").trim();
  if (!isAccountId(issuerAccountId)) return err("invalid_account");

  const holderAccountId = (raw.holderAccountId ?? "").trim();
  if (!isAccountId(holderAccountId)) return err("invalid_account");

  const assetCode = (raw.assetCode ?? "").trim();
  if (!ASSET_CODE.test(assetCode)) return err("invalid_account");

  return ok({ issuerAccountId, holderAccountId, assetCode });
}
