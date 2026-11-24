import { Address, xdr } from "@stellar/stellar-sdk";
import type { AuditRow, NonceReuse } from "../types";

/**
 * What a single SorobanCredentials value proves on its own.
 *
 * Source-account credentials carry no address, nonce, expiration ledger or
 * signature: the authorizing account is the transaction/operation source,
 * which is not part of the entry. They are never treated as an address.
 */
export type CredentialEvidence =
  | { kind: "source-account" }
  | {
      kind: "address";
      address: string;
      addressType: "account" | "contract";
      nonce: string;
      signatureExpirationLedger: number;
      signaturePayloadPresent: boolean;
    };

/** A discriminant the installed SDK defines but this audit cannot interpret. */
export class UnsupportedCredentialError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsupportedCredentialError";
  }
}

function addressType(scAddress: xdr.ScAddress): "account" | "contract" {
  const kind = scAddress.switch().value;
  if (kind === xdr.ScAddressType.scAddressTypeAccount().value) return "account";
  if (kind === xdr.ScAddressType.scAddressTypeContract().value) return "contract";
  throw new UnsupportedCredentialError(`Unsupported ScAddress type ${kind}`);
}

export function readCredentialEvidence(credentials: xdr.SorobanCredentials): CredentialEvidence {
  const kind = credentials.switch().value;
  if (kind === xdr.SorobanCredentialsType.sorobanCredentialsSourceAccount().value) return { kind: "source-account" };
  if (kind !== xdr.SorobanCredentialsType.sorobanCredentialsAddress().value) {
    throw new UnsupportedCredentialError(`Unsupported credential type ${kind}`);
  }
  const value = credentials.address();
  const scAddress = value.address();
  const type = addressType(scAddress);
  return {
    kind: "address",
    // Checked strkey (G… or C…) from the SDK; never a raw byte string.
    address: Address.fromScAddress(scAddress).toString(),
    addressType: type,
    // Int64 → decimal string keeps the full signed 64-bit range exact.
    nonce: value.nonce().toString(),
    signatureExpirationLedger: value.signatureExpirationLedger(),
    // A non-void SCVal is only payload presence, not a valid signature.
    signaturePayloadPresent: value.signature().switch().value !== xdr.ScValType.scvVoid().value
  };
}

/**
 * The complete identity a Soroban nonce is scoped to: the explicit network
 * passphrase plus the checked address. Two equal nonces only collide when
 * every component matches exactly.
 */
export function credentialIdentityKey(networkPassphrase: string, address: string, nonce: string): string {
  return JSON.stringify([networkPassphrase, address, nonce]);
}

/** Groups address-credential rows whose full network/address/nonce identity repeats in the bundle. */
export function indexNonceReuse(rows: AuditRow[], networkPassphrase: string): NonceReuse[] {
  const groups = new Map<string, NonceReuse>();
  for (const row of rows) {
    if (row.credential !== "address" || row.address === null || row.nonce === null) continue;
    const key = credentialIdentityKey(networkPassphrase, row.address, row.nonce);
    const group = groups.get(key) ?? { networkPassphrase, address: row.address, nonce: row.nonce, entryIndices: [] };
    group.entryIndices.push(row.index);
    groups.set(key, group);
  }
  return [...groups.values()].filter((group) => group.entryIndices.length > 1);
}
