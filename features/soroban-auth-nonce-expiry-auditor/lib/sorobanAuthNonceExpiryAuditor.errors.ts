import { xdr } from "@stellar/stellar-sdk";
import type { AuditErrorCode } from "../types";

const KNOWN_CREDENTIAL_TYPES = new Set<number>([
  xdr.SorobanCredentialsType.sorobanCredentialsSourceAccount().value,
  xdr.SorobanCredentialsType.sorobanCredentialsAddress().value
]);
const KNOWN_ADDRESS_TYPES = new Set<number>([
  xdr.ScAddressType.scAddressTypeAccount().value,
  xdr.ScAddressType.scAddressTypeContract().value
]);
const ADDRESS_CREDENTIAL = xdr.SorobanCredentialsType.sorobanCredentialsAddress().value;

/**
 * Maps a failed SorobanAuthorizationEntry decode to an actionable outcome.
 *
 * The entry's leading discriminants are read straight from the bytes, so an
 * unknown credential type (offset 0) or unknown ScAddress type (offset 4,
 * address credentials only; e.g. protocol 23 muxed addresses the installed SDK
 * does not define) is `unsupported_variant` without depending on SDK error
 * wording. Truncated or trailing bytes are `malformed_data`. Other unknown enum
 * members deeper in the entry are also reported as unsupported variants.
 */
export function decodeErrorCode(error: unknown, bytes: Uint8Array): AuditErrorCode {
  if (bytes.length < 4) return "malformed_data";
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const credentialType = view.getInt32(0);
  if (!KNOWN_CREDENTIAL_TYPES.has(credentialType)) return "unsupported_variant";
  if (credentialType === ADDRESS_CREDENTIAL) {
    if (bytes.length < 8) return "malformed_data";
    if (!KNOWN_ADDRESS_TYPES.has(view.getInt32(4))) return "unsupported_variant";
  }
  const message = error instanceof Error ? error.message : "";
  return /unknown \w+ member/i.test(message) ? "unsupported_variant" : "malformed_data";
}
