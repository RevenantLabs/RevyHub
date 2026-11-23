import { describe, expect, it } from "vitest";
import {
  assetKey,
  formatAccountId,
  formatAssetRef,
  formatSignedStroops,
  formatStroops
} from "@/features/transaction-balance-change-reconciler/lib/format";
import { issuer } from "@/features/transaction-balance-change-reconciler/fixtures/normal.fixture";

describe("format helpers", () => {
  it("formats stroops without floating point", () => {
    expect(formatStroops("100000001")).toBe("10.0000001");
    expect(formatStroops("-100")).toBe("-0.00001");
    expect(formatStroops("0")).toBe("0");
  });

  it("keeps issuer identity on credit assets", () => {
    const asset = { kind: "credit" as const, code: "USDC", issuer: issuer.publicKey() };
    expect(formatAssetRef(asset)).toBe(`USDC:${issuer.publicKey()}`);
    expect(assetKey(asset)).toContain(issuer.publicKey());
    expect(formatAssetRef({ kind: "native" })).toBe("XLM (native)");
  });

  it("prefixes positive signed deltas", () => {
    expect(formatSignedStroops("10000000")).toBe("+1");
    expect(formatSignedStroops("-10000000")).toBe("-1");
    expect(formatSignedStroops("0")).toBe("0");
  });

  it("abbreviates account ids without losing the ends", () => {
    const id = issuer.publicKey();
    const short = formatAccountId(id);
    expect(short.startsWith(id.slice(0, 4))).toBe(true);
    expect(short.endsWith(id.slice(-4))).toBe(true);
    expect(short).not.toBe(id);
  });
});
