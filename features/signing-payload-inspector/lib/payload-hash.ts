import { hash } from "@stellar/stellar-sdk";

/** The digest signed by an ordinary transaction or fee-bump signer. */
export function payloadHash(signatureBaseBytes: Buffer): Buffer {
  return hash(signatureBaseBytes);
}
