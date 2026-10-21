import type { SigningPayloadInspectorErrorCode } from "@/features/signing-payload-inspector/types";

/** A failed local XDR decode is malformed input; no transport is involved. */
export function toSigningPayloadInspectorErrorCode(): SigningPayloadInspectorErrorCode {
  return "invalid_xdr";
}
