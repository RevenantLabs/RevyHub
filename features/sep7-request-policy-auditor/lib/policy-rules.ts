import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { ErrorCode, Policy } from "../types";

const AMOUNT = /^(?:0|[1-9]\d*)(?:\.\d{1,7})?$/;
const HOST = /^[a-z0-9.-]+$/i;

export function parsePolicy(raw: string): Result<Policy, ErrorCode> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return err("invalid_policy");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return err("invalid_policy");
  const record = parsed as Record<string, unknown>;
  const destinations = record.destinations;
  const passphrases = record.passphrases;
  const callbackHosts = record.callbackHosts;
  if (!Array.isArray(destinations) || !destinations.length) return err("invalid_policy");
  if (!destinations.every((item) => typeof item === "string" && StrKey.isValidEd25519PublicKey(item))) return err("invalid_policy");
  if (typeof record.minAmount !== "string" || typeof record.maxAmount !== "string") return err("invalid_policy");
  if (!AMOUNT.test(record.minAmount) || !AMOUNT.test(record.maxAmount)) return err("invalid_policy");
  if (!Array.isArray(passphrases) || !passphrases.every((item) => typeof item === "string" && item.trim())) return err("invalid_policy");
  if (!Array.isArray(callbackHosts) || !callbackHosts.every((item) => typeof item === "string" && HOST.test(item))) return err("invalid_policy");
  const assets = record.assets ?? [];
  const memos = record.memos ?? [];
  if (!Array.isArray(assets) || !Array.isArray(memos)) return err("invalid_policy");
  const assetOk = assets.every((item) => {
    if (!item || typeof item !== "object") return false;
    const asset = item as Record<string, unknown>;
    return typeof asset.code === "string" && typeof asset.issuer === "string" && (asset.issuer === "" || StrKey.isValidEd25519PublicKey(asset.issuer));
  });
  if (!assetOk || !memos.every((item) => typeof item === "string")) return err("invalid_policy");
  return ok({
    destinations: destinations as string[],
    minAmount: record.minAmount,
    maxAmount: record.maxAmount,
    passphrases: passphrases as string[],
    callbackHosts: callbackHosts as string[],
    assets: assets as Policy["assets"],
    memos: memos as string[]
  });
}

/** Convert a SEP-0007 decimal amount into stroops without using floating point. */
export function toStroops(amount: string): bigint | null {
  if (!AMOUNT.test(amount)) return null;
  const [whole, fraction = ""] = amount.split(".");
  return BigInt(whole + fraction.padEnd(7, "0"));
}
