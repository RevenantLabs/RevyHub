import { describe, expect, it } from "vitest";
import { decodeLedgerHeader } from "@/features/ledger-header-decoder/lib/ledger-header-decode";
import { expectedHeader, ledgerHeaderXdr } from "@/features/ledger-header-decoder/fixtures/ledgerHeaderDecoder.fixture";
import { headerWithUpgradeXdr } from "@/features/ledger-header-decoder/fixtures/header-with-upgrade.fixture";
import { makeHeader } from "@/features/ledger-header-decoder/fixtures/standard-header.fixture";

describe("LedgerHeader XDR", () => {
  it("decodes every requested header and SCP field", () => {
    expect(decodeLedgerHeader(ledgerHeaderXdr)).toEqual({ ok: true, value: expectedHeader });
  });
  it("decodes an upgrade-bearing header", () => {
    const result = decodeLedgerHeader(headerWithUpgradeXdr);
    expect(result.ok && result.value.scpValue.upgrades).toHaveLength(6);
  });
  it("rejects truncated and trailing XDR bytes", () => {
    const bytes = Buffer.from(ledgerHeaderXdr, "base64");
    expect(decodeLedgerHeader(bytes.subarray(0, -4).toString("base64"))).toEqual({ ok: false, code: "malformed_header" });
    expect(decodeLedgerHeader(Buffer.concat([bytes, Buffer.alloc(4)]).toString("base64"))).toEqual({ ok: false, code: "malformed_header" });
  });
  it("rejects a header containing a malformed known upgrade without a partial result", () => {
    const malformed = makeHeader([Buffer.from([0, 0, 0, 1])]).toXDR("base64");
    expect(decodeLedgerHeader(malformed)).toEqual({ ok: false, code: "malformed_header" });
  });
});
