import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { ErrorCode, Sep7Fields } from "../types";

const AMOUNT = /^(?:0|[1-9]\d*)(?:\.\d{1,7})?$/;

function queryOf(uri: string): URLSearchParams | null {
  const query = uri.slice(uri.indexOf("?") + 1);
  if (!uri.includes("?")) return new URLSearchParams();
  return new URLSearchParams(query.replace(/\+/g, "%2B"));
}

/** Read supported SEP-0007 pay fields. Signature parameters are ignored. */
export function parseSep7Uri(uri: string): Result<Sep7Fields, ErrorCode> {
  const value = uri.trim();
  if (!value.startsWith("web+stellar:")) return err("invalid_uri");
  const operation = value.slice("web+stellar:".length).split("?")[0] ?? "";
  if (!operation) return err("invalid_uri");
  if (operation !== "pay") return err("unsupported_operation");
  const params = queryOf(value);
  if (!params) return err("invalid_uri");
  const destination = params.get("destination") ?? "";
  if (!destination || destination.startsWith("S") || !StrKey.isValidEd25519PublicKey(destination)) return err("invalid_uri");
  const amount = params.get("amount") ?? "";
  if (amount && !AMOUNT.test(amount)) return err("invalid_uri");
  return ok({
    operation,
    destination,
    amount,
    assetCode: params.get("asset_code") ?? "",
    assetIssuer: params.get("asset_issuer") ?? "",
    memo: params.get("memo") ?? "",
    networkPassphrase: params.get("network_passphrase") ?? "",
    callback: params.get("callback") ?? "",
    msg: params.get("msg") ?? ""
  });
}

export function callbackHost(callback: string): string | null {
  const raw = callback.startsWith("url:") ? callback.slice(4) : callback;
  if (!raw) return null;
  try {
    return new URL(raw).host;
  } catch {
    return null;
  }
}
