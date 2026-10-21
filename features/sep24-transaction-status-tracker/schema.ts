import { err, ok, type Result } from "@/core/result/result";
import type {
  Sep24Field,
  Sep24TransactionStatusTrackerErrorCode,
  Sep24TransactionStatusTrackerInput
} from "@/features/sep24-transaction-status-tracker/types";

const DOMAIN = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
const TRANSACTION_ID = /^[A-Za-z0-9_-]{1,128}$/;

export const FIELD_OF_CODE: Record<Sep24TransactionStatusTrackerErrorCode, Sep24Field | null> = {
  invalid_home_domain: "homeDomain",
  invalid_transaction_id: "transactionId",
  unauthorized: "token",
  missing_transfer_server: null,
  transaction_not_found: null,
  request_failed: null
};

export function parseSep24TransactionStatusTrackerInput(raw: {
  homeDomain: string;
  transactionId: string;
  token: string;
}): Result<Sep24TransactionStatusTrackerInput, Sep24TransactionStatusTrackerErrorCode> {
  const homeDomain = raw.homeDomain.trim().toLowerCase().replace(/\.$/, "");
  const transactionId = raw.transactionId.trim();
  const token = raw.token.trim();

  if (!DOMAIN.test(homeDomain)) return err("invalid_home_domain");
  if (!TRANSACTION_ID.test(transactionId)) return err("invalid_transaction_id");
  if (!isJwtShape(token) || isExpiredJwt(token)) return err("unauthorized");

  return ok({ homeDomain, transactionId, token });
}

function isJwtShape(token: string): boolean {
  const parts = token.split(".");
  return parts.length === 3 && parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part) && part.length > 0);
}

/** Reads exp without verifying the signature. A past exp is unauthorized before any request. */
export function isExpiredJwt(token: string): boolean {
  try {
    const payload = JSON.parse(decodeBase64Url(token.split(".")[1])) as { exp?: unknown };
    return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

function decodeBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
