import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { AccountMergeValueReconcilerErrorCode as Code, AccountMergeValueReconcilerInput as Input } from "./types";

/** Per-field character limit, checked before any normalisation or decoding. */
export const MAX_XDR_LENGTH = 262_144;
const BASE64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const SEED_CANDIDATE = /S[A-Z2-7]{55}/g;

/** True when the text contains a checksum-valid Stellar secret seed. */
export function containsSecretSeed(text: string): boolean {
  for (const match of text.matchAll(SEED_CANDIDATE)) {
    if (StrKey.isValidEd25519SecretSeed(match[0])) return true;
  }
  return false;
}

export function parseAccountMergeValueReconcilerInput(raw: Input): Result<Input, Code> {
  const fields = [raw?.envelope, raw?.resultXdr, raw?.metadataXdr];
  if (fields.some((field) => typeof field !== "string")) return err("invalid_input");
  if (fields.some((field) => field.length > MAX_XDR_LENGTH)) return err("too_large");
  // Never normalise or echo pasted secret material in an error detail.
  if (fields.some(containsSecretSeed)) return err("invalid_input");
  const [envelope, resultXdr, metadataXdr] = fields.map((field) => field.replace(/\s+/g, ""));
  if (!envelope || !resultXdr) return err("invalid_input");
  if ([envelope, resultXdr, metadataXdr].some((field) => field && (!BASE64.test(field) || field.length < 8))) return err("invalid_input");
  return ok({ envelope, resultXdr, metadataXdr });
}
