import { describe, expect, it } from "vitest";
import {
  formatKeypairExportJson,
  formatKeypairExportText,
  formatNetworkStatus,
  maskSecret
} from "@/features/testnet-keypair-generator/lib/format";
import { testnetKeypairGeneratorFixture } from "@/features/testnet-keypair-generator/fixtures/testnetKeypairGenerator.fixture";

describe("format helpers", () => {
  it("masks secret seeds safely", () => {
    const masked = maskSecret("SAAAAAAAAAAAAAAA");
    expect(masked.startsWith("S••••")).toBe(true);
    expect(masked.length).toBe(16);
  });

  it("handles empty secrets", () => {
    expect(maskSecret("")).toBe("");
  });

  it("formats network statuses accurately", () => {
    expect(formatNetworkStatus("unfunded")).toContain("Unfunded");
    expect(formatNetworkStatus("funded")).toContain("Funded");
    expect(formatNetworkStatus("skipped")).toContain("Skipped");
  });

  it("produces valid JSON export with safety notice", () => {
    const jsonStr = formatKeypairExportJson(testnetKeypairGeneratorFixture);
    const parsed = JSON.parse(jsonStr);
    expect(parsed.publicKey).toBe(testnetKeypairGeneratorFixture.publicKey);
    expect(parsed.secretSeed).toBe(testnetKeypairGeneratorFixture.secretSeed);
    expect(parsed.securityNotice).toBeDefined();
  });

  it("produces readable text export", () => {
    const text = formatKeypairExportText(testnetKeypairGeneratorFixture);
    expect(text).toContain(testnetKeypairGeneratorFixture.publicKey);
    expect(text).toContain(testnetKeypairGeneratorFixture.secretSeed);
    expect(text).toContain("Stellar Testnet Keypair");
  });
});
