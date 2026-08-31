import { describe, expect, it } from "vitest";
import { parseAssetStatisticsInput } from "@/features/asset-statistics/schema";
import {
  assetCode,
  issuerId,
  secretSeed
} from "@/features/asset-statistics/fixtures/assetStatistics.fixture";

describe("parseAssetStatisticsInput", () => {
  it("rejects an empty asset code", () => {
    expect(parseAssetStatisticsInput({ assetCode: " ", issuerId })).toEqual({
      ok: false,
      code: "empty_asset_code"
    });
  });

  it("enforces the 1-12 alphanumeric asset-code boundary", () => {
    expect(parseAssetStatisticsInput({ assetCode: "A", issuerId }).ok).toBe(true);
    expect(parseAssetStatisticsInput({ assetCode: "A1B2C3D4E5F6", issuerId }).ok).toBe(true);
    expect(parseAssetStatisticsInput({ assetCode: "A1B2C3D4E5F67", issuerId })).toEqual({
      ok: false,
      code: "invalid_asset_code"
    });
    expect(parseAssetStatisticsInput({ assetCode: "USD-C", issuerId })).toEqual({
      ok: false,
      code: "invalid_asset_code"
    });
  });

  it("rejects an empty or invalid issuer", () => {
    expect(parseAssetStatisticsInput({ assetCode, issuerId: " " })).toEqual({
      ok: false,
      code: "empty_issuer"
    });
    expect(parseAssetStatisticsInput({ assetCode, issuerId: issuerId.slice(0, -1) })).toEqual({
      ok: false,
      code: "invalid_issuer"
    });
  });

  it("rejects a secret seed on its prefix", () => {
    expect(parseAssetStatisticsInput({ assetCode, issuerId: secretSeed })).toEqual({
      ok: false,
      code: "invalid_issuer"
    });
  });

  it("trims fields without changing asset-code casing", () => {
    const result = parseAssetStatisticsInput({
      assetCode: ` ${assetCode.toLowerCase()} `,
      issuerId: ` ${issuerId}\n`
    });
    expect(result).toEqual({
      ok: true,
      value: { assetCode: assetCode.toLowerCase(), issuerId }
    });
  });
});
