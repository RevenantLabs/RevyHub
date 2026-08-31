import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  PaymentQrErrorCode,
  PaymentQrField,
  PaymentRequest
} from "@/features/payment-qr/types";

const ASSET_CODE = /^[A-Za-z0-9]{1,12}$/;
/** Stellar amounts carry at most 7 decimal places (1 stroop = 0.0000001 XLM). */
const AMOUNT = /^\d+(\.\d+)?$/;
const MAX_DECIMALS = 7;

/** SEP-0007 limits: `memo` as text is a 28-byte memo, `msg` is 300 characters. */
export const MEMO_MAX_BYTES = 28;
export const MSG_MAX_LENGTH = 300;

export const FIELD_OF_CODE: Record<PaymentQrErrorCode, PaymentQrField | null> = {
  empty_destination: "destination",
  invalid_destination: "destination",
  empty_amount: "amount",
  invalid_amount: "amount",
  amount_too_precise: "amount",
  empty_asset_code: "assetCode",
  invalid_asset_code: "assetCode",
  invalid_asset_issuer: "assetIssuer",
  memo_too_long: "memo",
  message_too_long: "msg",
  qr_generation_failed: null
};

export interface RawPaymentForm {
  destination: string;
  amount: string;
  assetKind: "native" | "issued";
  assetCode: string;
  assetIssuer: string;
  memo: string;
  msg: string;
}

export function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

export function parsePaymentRequest(
  raw: RawPaymentForm
): Result<PaymentRequest, PaymentQrErrorCode> {
  const destination = raw.destination.replace(/\s+/g, "");
  const amount = raw.amount.trim();
  const memo = raw.memo.trim();
  const msg = raw.msg.trim();

  if (!destination) return err("empty_destination");
  if (!StrKey.isValidEd25519PublicKey(destination)) return err("invalid_destination");

  if (!amount) return err("empty_amount");
  if (!AMOUNT.test(amount) || Number(amount) <= 0) return err("invalid_amount");
  if ((amount.split(".")[1] ?? "").length > MAX_DECIMALS) return err("amount_too_precise");

  // A text memo is limited by bytes, not characters: emoji and accented
  // letters cost more than one byte each.
  if (memo && byteLength(memo) > MEMO_MAX_BYTES) return err("memo_too_long");
  if (msg.length > MSG_MAX_LENGTH) return err("message_too_long");

  if (raw.assetKind === "native") {
    return ok({
      destination,
      amount,
      asset: { kind: "native" },
      memo: memo || undefined,
      msg: msg || undefined
    });
  }

  const code = raw.assetCode.trim();
  const issuer = raw.assetIssuer.replace(/\s+/g, "");

  if (!code) return err("empty_asset_code");
  if (!ASSET_CODE.test(code)) return err("invalid_asset_code");
  if (!StrKey.isValidEd25519PublicKey(issuer)) return err("invalid_asset_issuer");

  return ok({
    destination,
    amount,
    asset: { kind: "issued", code: code.toUpperCase(), issuer },
    memo: memo || undefined,
    msg: msg || undefined
  });
}
