import { describe, expect, it } from "vitest";
import { copy } from "../copy";
import { formatIdentity, formatLedger, formatNonce } from "../lib/format";
import { contractC } from "../fixtures/normal.fixture";
import type { AuditRow } from "../types";

const base: Omit<AuditRow, "credential" | "address" | "nonce"> = { index: 1, expirationLedger: null, expiry: "unknown", signaturePayloadPresent: null, signatureValidity: "unknown", onChainNonceAvailability: "unknown" };

describe("format", () => {
  it("keeps 64-bit nonce strings exact, including the signed minimum", () => {
    expect(formatNonce("9223372036854775807")).toBe("9223372036854775807");
    expect(formatNonce("-9223372036854775808")).toBe("-9223372036854775808");
    expect(formatNonce(null)).toBe(copy.sourceNonceUnavailable);
  });

  it("distinguishes a missing ledger from ledger zero", () => {
    expect(formatLedger(null)).toBe("Not supplied");
    expect(formatLedger(0)).toBe("0");
    expect(formatLedger(4294967295)).toBe("4294967295");
  });

  it("shows the full address identity and never guesses a source account", () => {
    expect(formatIdentity({ ...base, credential: "address", address: contractC, nonce: "1" })).toBe(contractC);
    expect(formatIdentity({ ...base, credential: "source-account", address: null, nonce: null })).toBe(copy.sourceIdentity);
  });
});
