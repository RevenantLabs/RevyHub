import { describe, expect, it } from "vitest";
import { Keypair, Networks, StrKey, xdr } from "@stellar/stellar-sdk";
import { credentialIdentityKey, indexNonceReuse, readCredentialEvidence, UnsupportedCredentialError } from "../lib/nonce-reuse-index";
import { accountA, accountB, addressEntry, contractC, networkPassphrase, sourceEntry } from "../fixtures/normal.fixture";
import type { AuditRow } from "../types";

const credentialsOf = (base64: string) => xdr.SorobanAuthorizationEntry.fromXDR(base64, "base64").credentials();
const row = (index: number, address: string, nonce: string): AuditRow => ({ index, address, nonce, credential: "address", expirationLedger: 1, expiry: "ready", signaturePayloadPresent: false, signatureValidity: "unknown", onChainNonceAvailability: "unknown" });
const sourceRow = (index: number): AuditRow => ({ index, address: null, nonce: null, credential: "source-account", expirationLedger: null, expiry: "unknown", signaturePayloadPresent: null, signatureValidity: "unknown", onChainNonceAvailability: "unknown" });

describe("readCredentialEvidence", () => {
  it("decodes a source-account credential without inventing an address or nonce", () => {
    expect(readCredentialEvidence(credentialsOf(sourceEntry))).toEqual({ kind: "source-account" });
  });

  it("decodes an account address credential with its checked G strkey", () => {
    expect(readCredentialEvidence(credentialsOf(addressEntry(accountA, "42", 77, false)))).toEqual({ kind: "address", address: accountA, addressType: "account", nonce: "42", signatureExpirationLedger: 77, signaturePayloadPresent: false });
  });

  it("decodes a contract address credential as a C strkey, distinct from an account", () => {
    const evidence = readCredentialEvidence(credentialsOf(addressEntry(contractC, "42")));
    expect(evidence).toMatchObject({ kind: "address", address: contractC, addressType: "contract" });
    expect(StrKey.isValidContract(contractC)).toBe(true);
  });

  it("keeps both ends of the signed int64 nonce range exact", () => {
    for (const nonce of ["9223372036854775807", "-9223372036854775808", "0"]) {
      expect(readCredentialEvidence(credentialsOf(addressEntry(accountA, nonce)))).toMatchObject({ nonce });
    }
  });

  it("keeps the uint32 expiration ledger boundaries exact", () => {
    expect(readCredentialEvidence(credentialsOf(addressEntry(accountA, "1", 0)))).toMatchObject({ signatureExpirationLedger: 0 });
    expect(readCredentialEvidence(credentialsOf(addressEntry(accountA, "1", 0xffffffff)))).toMatchObject({ signatureExpirationLedger: 4294967295 });
  });

  it("reports only signature payload presence, not validity", () => {
    // A one-byte payload is clearly not a valid ed25519 signature, yet it is present.
    expect(readCredentialEvidence(credentialsOf(addressEntry(accountA, "1", 1, true)))).toMatchObject({ signaturePayloadPresent: true });
    expect(readCredentialEvidence(credentialsOf(addressEntry(accountA, "1", 1, false)))).toMatchObject({ signaturePayloadPresent: false });
  });

  it("rejects a credential discriminant the audit does not interpret", () => {
    const unknown = { switch: () => ({ value: 7, name: "future" }) } as unknown as xdr.SorobanCredentials;
    expect(() => readCredentialEvidence(unknown)).toThrow(UnsupportedCredentialError);
  });

  it("rejects an address type the audit does not interpret", () => {
    const real = credentialsOf(addressEntry());
    const value = real.address();
    const forged = { switch: () => real.switch(), address: () => ({ address: () => ({ switch: () => ({ value: 3 }) }), nonce: () => value.nonce(), signatureExpirationLedger: () => 1, signature: () => value.signature() }) } as unknown as xdr.SorobanCredentials;
    expect(() => readCredentialEvidence(forged)).toThrow(UnsupportedCredentialError);
  });
});

describe("indexNonceReuse", () => {
  it("groups only exact network/address/nonce repeats", () => {
    expect(indexNonceReuse([row(1, accountA, "1"), row(2, accountB, "1"), row(3, accountA, "1"), row(4, accountA, "01")], networkPassphrase)).toEqual([{ address: accountA, networkPassphrase, nonce: "1", entryIndices: [1, 3] }]);
  });

  it("does not merge an account and a contract built from the same 32 bytes", () => {
    const bytes = Buffer.alloc(32, 9);
    const account = StrKey.encodeEd25519PublicKey(bytes);
    const contract = StrKey.encodeContract(bytes);
    expect(indexNonceReuse([row(1, account, "5"), row(2, contract, "5")], networkPassphrase)).toEqual([]);
  });

  it("excludes source-account credentials, even when several are present", () => {
    expect(indexNonceReuse([sourceRow(1), sourceRow(2)], networkPassphrase)).toEqual([]);
  });

  it("returns an empty list for an empty bundle", () => {
    expect(indexNonceReuse([], networkPassphrase)).toEqual([]);
  });

  it("reports three-way reuse in entry order and stamps the explicit network", () => {
    const other = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 4)).publicKey();
    expect(indexNonceReuse([row(5, other, "-1"), row(2, other, "-1"), row(9, other, "-1")], Networks.PUBLIC)).toEqual([{ address: other, networkPassphrase: Networks.PUBLIC, nonce: "-1", entryIndices: [5, 2, 9] }]);
  });

  it("scopes the identity key by network passphrase", () => {
    expect(credentialIdentityKey(Networks.TESTNET, accountA, "1")).not.toBe(credentialIdentityKey(Networks.PUBLIC, accountA, "1"));
    expect(credentialIdentityKey(Networks.TESTNET, accountA, "1")).toBe(credentialIdentityKey(Networks.TESTNET, accountA, "1"));
  });
});
