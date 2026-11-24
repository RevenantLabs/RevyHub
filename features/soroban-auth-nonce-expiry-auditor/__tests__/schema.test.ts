import { describe, expect, it } from "vitest";
import { containsSecretSeed, parseAuditInput, MAX_ENTRIES } from "../schema";
import { addressEntry, networkPassphrase } from "../fixtures/normal.fixture";
const raw = (bundle: string, evaluationLedger = "100") => ({bundle, networkPassphrase, evaluationLedger});
describe("audit input", () => {
  it("requires XDR and a network", () => { expect(parseAuditInput(raw(" ")).ok).toBe(false); expect(parseAuditInput({...raw(addressEntry()), networkPassphrase: " "}).ok).toBe(false); });
  it("rejects malformed base64 and ledger values", () => { expect(parseAuditInput(raw("not base64")).ok).toBe(false); expect(parseAuditInput(raw(addressEntry(), "-1")).ok).toBe(false); expect(parseAuditInput(raw(addressEntry(), "4294967296")).ok).toBe(false); });
  it("bounds count and size before decode", () => { expect(parseAuditInput(raw(Array(MAX_ENTRIES + 1).fill(addressEntry()).join("\n")))).toEqual({ok: false, code: "too_large"}); expect(parseAuditInput(raw("A".repeat(131073)))).toEqual({ok: false, code: "too_large"}); });
  it("rejects secret seeds", () => expect(parseAuditInput(raw("S" + "A".repeat(55)))).toEqual({ok: false, code: "invalid_input"}));
  it("rejects a bundle line on the S prefix alone and a seed in another field", () => {
    expect(parseAuditInput(raw(`${addressEntry()}\nSABC`))).toEqual({ok: false, code: "invalid_input"});
    expect(parseAuditInput({...raw(addressEntry()), networkPassphrase: "S" + "B".repeat(55)})).toEqual({ok: false, code: "invalid_input"});
    expect(parseAuditInput({...raw(addressEntry()), networkPassphrase: `custom:S${"B".repeat(55)}`})).toEqual({ok: false, code: "invalid_input"});
  });
  it("does not mistake seed-shaped text inside valid base64 XDR for a secret", () => {
    const line = "AAAAS" + "A".repeat(59);
    expect(containsSecretSeed({bundle: line, networkPassphrase, evaluationLedger: ""})).toBe(false);
    expect(parseAuditInput(raw(line)).ok).toBe(true);
  });
  it("accepts absent evaluation context", () => { const result = parseAuditInput(raw(addressEntry(), "")); expect(result.ok && result.value.evaluationLedger).toBeNull(); });
});
