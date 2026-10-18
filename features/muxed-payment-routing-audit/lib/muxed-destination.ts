import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { MuxedPaymentRoutingAuditErrorCode } from "@/features/muxed-payment-routing-audit/types";

export interface RawDestination extends Record<string, unknown> { to?: unknown; to_muxed?: unknown; to_muxed_id?: unknown; destination_muxed?: unknown; destination_muxed_id?: unknown; account?: unknown }
/** Only operation destination fields establish a route; source account is never used. */
export function normalizeMuxedDestination(record: RawDestination, baseAccount: string): Result<string | null | undefined, MuxedPaymentRoutingAuditErrorCode> {
  const to = record.to ?? record.account;
  const muxed = record.to_muxed ?? record.destination_muxed;
  const id = record.to_muxed_id ?? record.destination_muxed_id;
  if (typeof to !== "string" || !StrKey.isValidEd25519PublicKey(to)) return err("malformed_payment");
  if (to !== baseAccount) return ok(undefined);
  if (muxed === undefined && id === undefined) return ok(null);
  if (typeof muxed !== "string" || !StrKey.isValidMed25519PublicKey(muxed) || typeof id !== "string" || !/^(0|[1-9]\d*)$/.test(id)) return err("malformed_payment");
  const decoded = StrKey.decodeMed25519PublicKey(muxed);
  const decodedBase = StrKey.encodeEd25519PublicKey(decoded.subarray(0, 32));
  const decodedId = decoded.readBigUInt64BE(32).toString();
  if (decodedBase !== baseAccount || decodedId !== id) return err("malformed_payment");
  return ok(id);
}
