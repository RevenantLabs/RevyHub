import { describe, expect, it } from "vitest";
import { decodeScpValue } from "@/features/ledger-header-decoder/lib/scp-value-fields";
import { makeHeader } from "@/features/ledger-header-decoder/fixtures/standard-header.fixture";
import { upgradeBytes } from "@/features/ledger-header-decoder/fixtures/header-with-upgrade.fixture";

describe("SCP value", () => {
  it("reads close time, hash and all upgrades", () => {
    const result = decodeScpValue(makeHeader(upgradeBytes).scpValue());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.closeTime).toBe("1760000000");
    expect(result.value.txSetHash).toBe("11".repeat(32));
    expect(result.value.upgrades).toHaveLength(6);
  });
  it("fails if an embedded known upgrade is malformed", () => {
    expect(decodeScpValue(makeHeader([Buffer.from([0, 0, 0, 1])]).scpValue())).toEqual({ ok: false, code: "malformed_header" });
  });
});
