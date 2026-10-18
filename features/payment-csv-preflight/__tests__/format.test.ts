import { describe, expect, it } from "vitest";
import { copy, errorCopy, rowIssueCopy } from "@/features/payment-csv-preflight/copy";
import {
  describeError,
  filterRows,
  formatAmount,
  formatAssetLabel,
  formatDuplicateLines,
  formatOptionalColumns,
  formatOverview,
  formatRowAdvice,
  hasAmbiguousAssetCodes
} from "@/features/payment-csv-preflight/lib/format";
import {
  issuerA,
  issuerB,
  paymentCsvPreflightFixture
} from "@/features/payment-csv-preflight/fixtures/paymentCsvPreflight.fixture";
import type { AssetTotal } from "@/features/payment-csv-preflight/types";

const native = { key: "native", code: "XLM", issuer: null, isNative: true } as const;
const usdcA = { key: `USDC:${issuerA}`, code: "USDC", issuer: issuerA, isNative: false } as const;
const usdcB = { key: `USDC:${issuerB}`, code: "USDC", issuer: issuerB, isNative: false } as const;

const total = (asset: AssetTotal["asset"]): AssetTotal => ({ asset, total: "1.0000000", rowCount: 1 });

describe("formatAmount", () => {
  it("groups the whole part and trims trailing zeros", () => {
    expect(formatAmount("11.5000000")).toBe("11.5");
    expect(formatAmount("1234567.0000000")).toBe("1,234,567");
  });

  it("keeps every significant decimal place", () => {
    expect(formatAmount("250.0000001")).toBe("250.0000001");
  });

  it("stays exact past the safe integer range", () => {
    expect(formatAmount("922337203685.4775807")).toBe("922,337,203,685.4775807");
  });
});

describe("formatAssetLabel", () => {
  it("names lumens without an issuer", () => {
    expect(formatAssetLabel(native)).toBe(copy.assetNative);
  });

  it("always shows the issuer beside the code", () => {
    const label = formatAssetLabel(usdcA);
    expect(label).toContain("USDC");
    expect(label).toContain(issuerA.slice(0, 4));
    expect(label).not.toBe(formatAssetLabel(usdcB));
  });

  it("labels a row whose asset could not be resolved", () => {
    expect(formatAssetLabel(null)).toBe(copy.assetUnresolved);
  });
});

describe("formatOverview", () => {
  it("reports valid, invalid and duplicate counts", () => {
    expect(formatOverview(paymentCsvPreflightFixture)).toBe(copy.overview(3, 0, 0));
  });
});

describe("formatRowAdvice", () => {
  it("says the row is ready when it has no issues", () => {
    expect(formatRowAdvice([])).toBe(copy.rowValid);
  });

  it("joins several issues in the order they were found", () => {
    expect(formatRowAdvice(["invalid_destination", "too_many_decimals"])).toBe(
      `${rowIssueCopy.invalid_destination} ${rowIssueCopy.too_many_decimals}`
    );
  });

  it("has advice for every row issue code", () => {
    for (const [code, advice] of Object.entries(rowIssueCopy)) {
      expect(advice, code).not.toHaveLength(0);
    }
  });
});

describe("formatDuplicateLines", () => {
  it("uses the singular and plural forms", () => {
    expect(formatDuplicateLines([4])).toContain("line 4");
    expect(formatDuplicateLines([2, 4])).toContain("lines 2, 4");
  });
});

describe("formatOptionalColumns", () => {
  it("lists the optional columns that were present", () => {
    expect(formatOptionalColumns(["memo_type", "memo_value"])).toBe("memo_type, memo_value");
  });

  it("says so when none were", () => {
    expect(formatOptionalColumns([])).toBe(copy.summaryOptionalColumnsNone);
  });
});

describe("describeError", () => {
  it("returns the plain description with no detail", () => {
    expect(describeError("empty_input")).toBe(errorCopy.empty_input.description);
  });

  it("appends the line reference a CSV failure carries", () => {
    expect(describeError("invalid_csv", 7)).toBe(
      `${errorCopy.invalid_csv.description} The first problem is at line 7.`
    );
  });

  it("ignores a detail that is not a line number", () => {
    expect(describeError("invalid_csv", "somewhere")).toBe(errorCopy.invalid_csv.description);
  });

  it("has copy for every error code", () => {
    for (const [code, entry] of Object.entries(errorCopy)) {
      expect(entry.title, code).not.toHaveLength(0);
      expect(entry.description, code).not.toHaveLength(0);
    }
  });
});

describe("filterRows", () => {
  const rows = [
    { ...paymentCsvPreflightFixture.rows[0], valid: true },
    { ...paymentCsvPreflightFixture.rows[1], valid: false }
  ];

  it("returns every row for the all filter", () => {
    expect(filterRows(rows, "all")).toHaveLength(2);
  });

  it("splits valid from invalid", () => {
    expect(filterRows(rows, "valid")).toHaveLength(1);
    expect(filterRows(rows, "invalid")).toHaveLength(1);
    expect(filterRows(rows, "invalid")[0]?.valid).toBe(false);
  });

  it("does not mutate the rows it was given", () => {
    const copyOfRows = [...rows];
    filterRows(rows, "valid");
    expect(rows).toEqual(copyOfRows);
  });
});

describe("hasAmbiguousAssetCodes", () => {
  it("is true when one code appears under two issuers", () => {
    expect(hasAmbiguousAssetCodes([total(usdcA), total(usdcB)])).toBe(true);
  });

  it("is false for distinct codes", () => {
    expect(hasAmbiguousAssetCodes([total(native), total(usdcA)])).toBe(false);
  });
});
