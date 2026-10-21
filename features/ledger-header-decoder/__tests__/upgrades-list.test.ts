import { describe, expect, it } from "vitest";
import { decodeUpgrades } from "@/features/ledger-header-decoder/lib/upgrades-list";
import { upgradeBytes } from "@/features/ledger-header-decoder/fixtures/header-with-upgrade.fixture";

describe("upgrade decoding", () => {
  it("keeps every numeric upgrade and unknown bytes in order", () => {
    const result = decodeUpgrades(upgradeBytes);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.map((item) => item.type)).toEqual(["protocol_version", "base_fee", "base_reserve", "max_tx_set_size", "flags", "unrecognized"]);
    expect(result.value.map((item) => item.value)).toEqual(["24", "200", "10000000", "2000", "1", null]);
    expect(result.value.at(-1)?.rawHex).toBe("0000006312345678");
  });
  it("rejects truncated known variants and incomplete discriminants", () => {
    expect(decodeUpgrades([upgradeBytes[0].subarray(0, 4)])).toEqual({ ok: false, code: "malformed_header" });
    expect(decodeUpgrades([Buffer.from([0, 0, 0])])).toEqual({ ok: false, code: "malformed_header" });
  });
});
