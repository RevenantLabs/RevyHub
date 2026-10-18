import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { MuxedPaymentRoutingAuditInput, MuxedPaymentRoutingAuditErrorCode } from "@/features/muxed-payment-routing-audit/types";

/** Reject secret seeds by prefix before any checksum work. Never return raw invalid input. */
export function parseMuxedPaymentRoutingAuditInput(raw: string): Result<MuxedPaymentRoutingAuditInput, MuxedPaymentRoutingAuditErrorCode> {
  const accountId = raw.trim();
  if (accountId.startsWith("S") || !StrKey.isValidEd25519PublicKey(accountId)) return err("invalid_account");
  return ok({ accountId });
}
