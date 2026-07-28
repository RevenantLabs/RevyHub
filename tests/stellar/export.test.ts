import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getExportFilename, createBalanceSnapshot } from "@/lib/export";
import type { DisplayBalance } from "@/components/stellar/BalanceList";

describe("getExportFilename", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-28T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("generates a deterministic filename with network and short public key", () => {
    const filename = getExportFilename("testnet", "GBFLARKARBITRARYKEY1234567890");
    expect(filename).toBe("revyhubx-balances-testnet-GBFLARKA-2026-07-28.json");
  });

  it("uses the first 8 characters of the public key", () => {
    const filename = getExportFilename("mainnet", "GA1234567890ABCDEF");
    expect(filename).toBe("revyhubx-balances-mainnet-GA123456-2026-07-28.json");
  });

  it("contains only alphanumeric characters, hyphens, and a dot", () => {
    const filename = getExportFilename("testnet", "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
    // Only safe filename characters: alphanumeric, hyphens, periods
    expect(filename).toMatch(/^[a-zA-Z0-9\-.]+\.[a-z]+$/);
  });

  it("is filesystem-safe with no spaces or special chars", () => {
    const filename = getExportFilename("mainnet", "GABC1234");
    expect(filename).not.toContain(" ");
    expect(filename).not.toContain("/");
    expect(filename).not.toContain("\\");
    expect(filename).not.toContain(":");
    expect(filename).not.toContain("<");
    expect(filename).not.toContain(">");
  });

  it("uses the current date in YYYY-MM-DD format", () => {
    const filename = getExportFilename("testnet", "GABC1234");
    // The date portion should be in the filename
    expect(filename).toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});

describe("createBalanceSnapshot", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-28T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a Blob with application/json type", () => {
    const balances: DisplayBalance[] = [
      { assetCode: "XLM", amount: "10000.0000000" }
    ];

    const blob = createBalanceSnapshot("testnet", "GBFLARKARBITRARYKEY", balances);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("application/json");
  });

  it("includes network, publicKey, exportedAt, and balances in the JSON", async () => {
    const balances: DisplayBalance[] = [
      { assetCode: "XLM", amount: "10000.0000000" },
      { assetCode: "USDC", issuer: "GBFLARKISSUER123456789", amount: "500.0000000" }
    ];

    const blob = createBalanceSnapshot("mainnet", "GA1234567890ABCDEF", balances);
    const text = await blob.text();
    const parsed = JSON.parse(text);

    expect(parsed).toEqual({
      network: "mainnet",
      publicKey: "GA1234567890ABCDEF",
      exportedAt: "2026-07-28T12:00:00.000Z",
      balances: [
        { assetCode: "XLM", amount: "10000.0000000" },
        { assetCode: "USDC", issuer: "GBFLARKISSUER123456789", amount: "500.0000000" }
      ]
    });
  });

  it("does not include localStorage data, wallet permissions, or unrelated form values", async () => {
    const balances: DisplayBalance[] = [
      { assetCode: "XLM", amount: "10000.0000000" }
    ];

    const blob = createBalanceSnapshot("testnet", "GABC1234", balances);
    const text = await blob.text();
    const parsed = JSON.parse(text);

    // Only expected keys
    expect(Object.keys(parsed)).toEqual(["network", "publicKey", "exportedAt", "balances"]);

    // No sensitive data
    expect(parsed).not.toHaveProperty("secretKey");
    expect(parsed).not.toHaveProperty("seed");
    expect(parsed).not.toHaveProperty("mnemonic");
    expect(parsed).not.toHaveProperty("localStorage");
  });
});
