import { err, ok, type Result } from "@/core/result/result";
import type { SigningPayloadInspectorErrorCode, SigningPayloadInspectorInput } from "@/features/signing-payload-inspector/types";

/** Limit both raw paste and decoded bytes before invoking the XDR decoder. */
export const MAX_XDR_LENGTH = 65_536;
const BASE64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

export function parseSigningPayloadInspectorInput(raw: string): Result<SigningPayloadInspectorInput, SigningPayloadInspectorErrorCode> {
  if (raw.length > MAX_XDR_LENGTH) return err("too_large");
  if (!raw.trim()) return err("empty_xdr");
  const envelope = raw.replace(/\s+/g, "");
  if (envelope.length > MAX_XDR_LENGTH) return err("too_large");
  if (!BASE64.test(envelope)) return err("invalid_xdr");
  return ok({ envelope });
}
