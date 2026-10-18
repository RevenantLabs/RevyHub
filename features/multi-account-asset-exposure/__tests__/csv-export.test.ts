import { describe, expect, it } from "vitest";
import { csvCell, exportExposureCsv } from "../lib/csv-export";
import { buildAssetMatrix } from "../lib/asset-matrix";
import { partialFailureAccounts } from "../fixtures/partial-failure.fixture";
import { accountA, accountB, accountC, issuerA } from "../fixtures/multiAccountAssetExposure.fixture";
describe("public CSV", () => {
  it("escapes delimiters, quotes and newlines", () => {
    expect(csvCell('a,"b"\nc')).toBe('"a,""b""\nc"');
  });
  it("keeps input columns and a status row with a blank failed cell", () => {
    const csv = exportExposureCsv({ accounts: partialFailureAccounts, matrix: buildAssetMatrix(partialFailureAccounts) });
    expect(csv).toBe(`asset_type,asset_code,issuer,${accountA},${accountB},${accountC},total\r\n` +
      "account_status,,,loaded,account_not_found,loaded,\r\n" +
      `credit,USD,${issuerA},1.1,,0.9,2\r\n`);
    expect(csv).not.toContain("SNOTASEED");
  });
});
