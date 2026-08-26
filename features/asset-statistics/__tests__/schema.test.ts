import { describe, expect, it } from "vitest";
import { parseAssetStatisticsInput } from "@/features/asset-statistics/schema";
import { issuerId } from "@/features/asset-statistics/fixtures/assetStatistics.fixture";

describe("parseAssetStatisticsInput", () => {
  it("accepts valid input", () => {
    const result = parseAssetStatisticsInput({
      assetCode: "USDC",
      issuerId
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.assetCode).toBe("USDC");
      expect(result.value.issuerId).toBe(issuerId);
    }
  });

  it("trims whitespace from input", () => {
    const result = parseAssetStatisticsInput({
      assetCode: "  USDC  ",
      issuerId: `  ${issuerId}  `
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.assetCode).toBe("USDC");
      expect(result.value.issuerId).toBe(issuerId);
    }
  });

  it("returns empty_asset_code when code is missing", () => {
    const result = parseAssetStatisticsInput({ assetCode: "", issuerId });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("empty_asset_code");
  });

  it("returns invalid_asset_code when code has punctuation", () => {
    const result = parseAssetStatisticsInput({ assetCode: "USD-C", issuerId });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("invalid_asset_code");
  });

  it("returns empty_issuer when issuer is missing", () => {
    const result = parseAssetStatisticsInput({ assetCode: "USDC", issuerId: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("empty_issuer");
  });

  it("returns invalid_issuer when issuer is not a valid address", () => {
    const result = parseAssetStatisticsInput({ assetCode: "USDC", issuerId: "NOT_AN_ADDRESS" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("invalid_issuer");
  });

  it("returns invalid_issuer for a seed", () => {
    const result = parseAssetStatisticsInput({
      assetCode: "USDC",
      issuerId: "SACKZZH2G54P75Q42M66IHR72QFYZHT3T6Z2X7K3IUD36YHRFZB7H4F4"
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("invalid_issuer");
  });
});
