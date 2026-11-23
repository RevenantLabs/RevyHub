import { describe, expect, it, vi } from "vitest";
import { auditSorobanAuth } from "../lib/sorobanAuthNonceExpiryAuditor";
import { addressEntry, accountA, contractC, networkPassphrase, sourceEntry } from "../fixtures/normal.fixture";
import { separateAccountsBundle, malformedBundle } from "../fixtures/boundary.fixture";
const input = (entries: string[], evaluationLedger: number | null = 100) => ({entries, networkPassphrase, evaluationLedger});
describe("Soroban auth audit", () => {
  it("groups identical address/network/nonce and preserves 64-bit nonce", () => {
    const result = auditSorobanAuth(input([addressEntry(accountA, "9223372036854775807", 100, true), addressEntry()]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.reuse).toEqual([{address: accountA, networkPassphrase, nonce: "9223372036854775807", entryIndices: [1, 2]}]);
    expect(result.value.rows[0].signaturePayloadPresent).toBe(true);
    expect(result.value.rows[0].signatureValidity).toBe("unknown");
    expect(result.value.rows[0].onChainNonceAvailability).toBe("unknown");
  });
  it("does not merge identical nonces across accounts, and leaves source context unknown", () => {
    const result = auditSorobanAuth(input(separateAccountsBundle.split("\n")));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.reuse).toEqual([]);
    expect(result.value.rows[2]).toMatchObject({credential: "source-account", address: null, nonce: null, expiry: "unknown"});
    expect(result.value.incompleteEvidence).toBe(true);
  });
  it("keeps contract and account identities apart for an equal nonce", () => {
    const result = auditSorobanAuth(input([addressEntry(accountA, "5"), addressEntry(contractC, "5"), addressEntry(contractC, "5")]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.rows[1].address).toBe(contractC);
    expect(result.value.reuse).toEqual([{address: contractC, networkPassphrase, nonce: "5", entryIndices: [2, 3]}]);
  });
  it("preserves the signed int64 nonce range exactly", () => {
    const result = auditSorobanAuth(input([addressEntry(accountA, "-9223372036854775808")]));
    expect(result.ok && result.value.rows[0].nonce).toBe("-9223372036854775808");
  });
  it("treats expiration ledger as inclusive", () => {
    const result = auditSorobanAuth(input([addressEntry(accountA, "1", 100), addressEntry(accountA, "2", 99)]));
    expect(result.ok && result.value.rows.map((row) => row.expiry)).toEqual(["ready", "expired"]);
  });
  it("shows incomplete evidence without an evaluation ledger", () => {
    const result = auditSorobanAuth(input([addressEntry()], null));
    expect(result.ok && result.value.rows[0].expiry).toBe("unknown");
    expect(result.ok && result.value.incompleteEvidence).toBe(true);
  });
  it("returns malformed data for truncated XDR", () => expect(auditSorobanAuth(input([malformedBundle]))).toEqual({ok: false, code: "malformed_data"}));
  it("returns unsupported variant for an unknown credential discriminant", () => {
    const bytes = Buffer.from(addressEntry(), "base64");
    bytes.writeUInt32BE(2, 0);
    expect(auditSorobanAuth(input([bytes.toString("base64")]))).toEqual({ok: false, code: "unsupported_variant"});
  });
  it("refuses an unknown address type inside otherwise valid credential XDR", () => {
    const bytes = Buffer.from(addressEntry(), "base64");
    bytes.writeUInt32BE(9, 4);
    expect(auditSorobanAuth(input([bytes.toString("base64")]))).toEqual({ok: false, code: "unsupported_variant"});
  });
  it("does not classify a source-account entry as an address", () => {
    const result = auditSorobanAuth(input([sourceEntry]));
    expect(result.ok && result.value.rows[0].signaturePayloadPresent).toBeNull();
  });
  it("never requests network evidence", () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    try {
      auditSorobanAuth(input([addressEntry()]));
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      fetch.mockRestore();
    }
  });
});
