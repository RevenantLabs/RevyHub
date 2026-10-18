import { describe, expect, it } from "vitest";
import {
  exportRows,
  fromStroops,
  markDuplicates,
  MAX_STROOPS,
  resolveAsset,
  runPreflight,
  toStroops,
  totalsByAsset,
  validateAmount,
  validateDestination
} from "@/features/payment-csv-preflight/lib/paymentCsvPreflight";
import { readCsvFile, shouldRedact } from "@/features/payment-csv-preflight/lib/paymentCsvPreflight.errors";
import { MAX_FILE_BYTES } from "@/features/payment-csv-preflight/schema";
import {
  bomCrlfCsv,
  duplicateHeaderCsv,
  duplicateRowsCsv,
  firstDestination,
  invalidRowsCsv,
  issuerA,
  issuerB,
  missingHeaderCsv,
  muxedDestination,
  oversizedCsv,
  quotedCsv,
  sameCodeDifferentIssuerCsv,
  secondDestination,
  secretKeyRowCsv,
  secretSeed,
  shortRowCsv,
  textAfterQuoteCsv,
  truncatedDestination,
  unterminatedQuoteCsv,
  validCsv
} from "@/features/payment-csv-preflight/fixtures/paymentCsvPreflight.fixture";
import type { PaymentRow } from "@/features/payment-csv-preflight/types";

function report(csv: string) {
  const result = runPreflight({ csv });
  if (!result.ok) throw new Error(`expected a report, got ${result.code}`);
  return result.value;
}

describe("toStroops / fromStroops", () => {
  it("round-trips seven decimal places exactly", () => {
    expect(toStroops("1.0000001")).toBe(10_000_001n);
    expect(fromStroops(10_000_001n)).toBe("1.0000001");
  });

  it("keeps precision past the safe integer range", () => {
    expect(fromStroops(toStroops("922337203685.4775807"))).toBe("922337203685.4775807");
  });
});

describe("validateAmount", () => {
  it("accepts a plain and a fully precise amount", () => {
    expect(validateAmount("10")).toBeNull();
    expect(validateAmount("0.0000001")).toBeNull();
  });

  it("rejects an empty amount", () => {
    expect(validateAmount("")).toBe("missing_amount");
  });

  it("rejects shapes Number would happily parse", () => {
    expect(validateAmount("1e3")).toBe("invalid_amount");
    expect(validateAmount("-5")).toBe("invalid_amount");
    expect(validateAmount("1,000")).toBe("invalid_amount");
    expect(validateAmount(" 10")).toBe("invalid_amount");
  });

  it("rejects zero rather than paying nothing", () => {
    expect(validateAmount("0")).toBe("non_positive_amount");
    expect(validateAmount("0.0000000")).toBe("non_positive_amount");
  });

  it("rejects an eighth decimal place instead of rounding it away", () => {
    expect(validateAmount("1.12345678")).toBe("too_many_decimals");
  });

  it("accepts the largest representable amount and rejects one stroop more", () => {
    expect(validateAmount(fromStroops(MAX_STROOPS))).toBeNull();
    expect(validateAmount(fromStroops(MAX_STROOPS + 1n))).toBe("amount_too_large");
  });
});

describe("resolveAsset", () => {
  it("treats XLM and native with no issuer as lumens", () => {
    expect(resolveAsset("XLM", "").asset).toMatchObject({ key: "native", isNative: true });
    expect(resolveAsset("native", "").asset).toMatchObject({ key: "native" });
  });

  it("rejects an issuer on lumens", () => {
    expect(resolveAsset("XLM", issuerA).issue).toBe("unexpected_issuer_for_native");
  });

  it("keeps the issuer in the identity of an issued asset", () => {
    expect(resolveAsset("USDC", issuerA).asset?.key).toBe(`USDC:${issuerA}`);
  });

  it("never gives two issuers of one code the same identity", () => {
    expect(resolveAsset("USDC", issuerA).asset?.key).not.toBe(resolveAsset("USDC", issuerB).asset?.key);
  });

  it("reports missing and malformed asset fields", () => {
    expect(resolveAsset("", "").issue).toBe("missing_asset_code");
    expect(resolveAsset("US DC", issuerA).issue).toBe("invalid_asset_code");
    expect(resolveAsset("USDCUSDCUSDC1", issuerA).issue).toBe("invalid_asset_code");
    expect(resolveAsset("USDC", "").issue).toBe("missing_asset_issuer");
    expect(resolveAsset("USDC", truncatedDestination).issue).toBe("invalid_asset_issuer");
  });
});

describe("validateDestination", () => {
  it("accepts a G address and keeps an M address as written", () => {
    expect(validateDestination(firstDestination)).toBeNull();
    expect(validateDestination(muxedDestination)).toBeNull();
  });

  it("rejects a secret seed on its prefix", () => {
    expect(validateDestination(secretSeed)).toBe("secret_key_destination");
  });

  it("reports an empty or broken address", () => {
    expect(validateDestination("   ")).toBe("missing_destination");
    expect(validateDestination(truncatedDestination)).toBe("invalid_destination");
  });
});

describe("runPreflight", () => {
  it("validates every row and reports exact totals", () => {
    const result = report(validCsv);

    expect(result.rows).toHaveLength(3);
    expect(result.validCount).toBe(3);
    expect(result.invalidCount).toBe(0);
    expect(result.optionalColumns).toEqual(["memo_type", "memo_value"]);
    expect(result.totals).toEqual([
      {
        asset: { key: "native", code: "XLM", issuer: null, isNative: true },
        total: "11.5000000",
        rowCount: 2
      },
      {
        asset: { key: `USDC:${issuerA}`, code: "USDC", issuer: issuerA, isNative: false },
        total: "250.0000001",
        rowCount: 1
      }
    ]);
  });

  it("retains the original row order and original line numbers", () => {
    const result = report(validCsv);
    expect(result.rows.map((row) => row.line)).toEqual([2, 3, 4]);
    expect(result.rows.map((row) => row.index)).toEqual([1, 2, 3]);
    expect(result.rows[0]?.destination).toBe(firstDestination);
  });

  it("totals the same code under different issuers separately", () => {
    const result = report(sameCodeDifferentIssuerCsv);

    expect(result.totals).toHaveLength(2);
    expect(result.totals.map((total) => total.asset.issuer)).toEqual([issuerA, issuerB]);
    expect(result.totals.every((total) => total.total === "100.0000000")).toBe(true);
  });

  it("flags duplicate rows without dropping either of them", () => {
    const result = report(duplicateRowsCsv);

    expect(result.rows).toHaveLength(3);
    expect(result.duplicateCount).toBe(2);
    expect(result.rows[0]?.duplicateOf).toEqual([4]);
    expect(result.rows[2]?.duplicateOf).toEqual([2]);
    // Both rows still count towards the total.
    expect(result.totals[0]?.total).toBe("25.0000000");
  });

  it("parses quoted commas, doubled quotes and multiline values", () => {
    const result = report(quotedCsv);

    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]?.memoValue).toBe('Invoice 7, part "two"');
    expect(result.rows[1]?.memoValue).toBe("first line\nsecond line");
    expect(result.validCount).toBe(2);
  });

  it("handles a byte-order mark and CRLF line endings", () => {
    const result = report(bomCrlfCsv);

    expect(result.rows).toHaveLength(2);
    expect(result.validCount).toBe(2);
    expect(result.rows.map((row) => row.destination)).toEqual([firstDestination, secondDestination]);
  });

  it("keeps every failing row, each with its own issues", () => {
    const result = report(invalidRowsCsv);

    expect(result.rows).toHaveLength(7);
    expect(result.validCount).toBe(0);
    expect(result.rows.map((row) => row.issues)).toEqual([
      ["invalid_destination"],
      ["non_positive_amount"],
      ["too_many_decimals"],
      ["invalid_amount"],
      ["missing_asset_issuer"],
      ["unexpected_issuer_for_native"],
      ["invalid_memo_type"]
    ]);
  });

  it("never carries a secret key into the report", () => {
    const result = report(secretKeyRowCsv);

    expect(result.rows[0]?.issues).toEqual(["secret_key_destination"]);
    expect(result.rows[0]?.destination).toBe("");
    expect(JSON.stringify(result)).not.toContain(secretSeed);
  });

  it("marks a row whose columns no longer line up", () => {
    const result = report(shortRowCsv);
    expect(result.rows[0]?.issues).toContain("wrong_column_count");
  });

  it("reports malformed quoting with the line the record started on", () => {
    expect(runPreflight({ csv: unterminatedQuoteCsv })).toEqual({
      ok: false,
      code: "invalid_csv",
      detail: 2
    });
    expect(runPreflight({ csv: textAfterQuoteCsv })).toMatchObject({
      ok: false,
      code: "invalid_csv"
    });
  });

  it("rejects a header line that is missing or repeats a column", () => {
    expect(runPreflight({ csv: missingHeaderCsv })).toEqual({ ok: false, code: "invalid_headers" });
    expect(runPreflight({ csv: duplicateHeaderCsv })).toEqual({
      ok: false,
      code: "invalid_headers"
    });
  });

  it("rejects more rows than the documented bound", () => {
    expect(runPreflight({ csv: oversizedCsv() })).toEqual({ ok: false, code: "input_too_large" });
  });

  it("treats a header with no data rows as an empty report", () => {
    const result = report("destination,amount,asset_code,asset_issuer");
    expect(result.rows).toHaveLength(0);
    expect(result.totals).toHaveLength(0);
  });
});

describe("markDuplicates", () => {
  const row = (line: number, destination: string, valid = true): PaymentRow => ({
    line,
    index: line - 1,
    destination,
    amount: "1",
    asset: { key: "native", code: "XLM", issuer: null, isNative: true },
    memoType: null,
    memoValue: null,
    issues: [],
    valid,
    duplicateOf: []
  });

  it("ignores invalid rows, which have nothing trustworthy to compare", () => {
    const rows = [row(2, firstDestination, false), row(3, firstDestination, false)];
    markDuplicates(rows);
    expect(rows.every((entry) => entry.duplicateOf.length === 0)).toBe(true);
  });

  it("links every member of a group of three", () => {
    const rows = [row(2, firstDestination), row(3, firstDestination), row(4, firstDestination)];
    markDuplicates(rows);
    expect(rows.map((entry) => entry.duplicateOf)).toEqual([
      [3, 4],
      [2, 4],
      [2, 3]
    ]);
  });
});

describe("totalsByAsset", () => {
  it("returns assets in first-appearance order", () => {
    const result = report(validCsv);
    expect(totalsByAsset(result.rows).map((total) => total.asset.key)).toEqual([
      "native",
      `USDC:${issuerA}`
    ]);
  });
});

describe("exportRows", () => {
  it("refuses to export while a row is invalid", () => {
    expect(exportRows(report(invalidRowsCsv))).toEqual({ ok: false, code: "invalid_rows" });
  });

  it("exports every validated row with its exact totals", () => {
    const result = exportRows(report(validCsv));
    expect(result.ok).toBe(true);

    const payload = JSON.parse(result.ok ? result.value : "{}");
    expect(payload.rowCount).toBe(3);
    expect(payload.rows[1]).toMatchObject({
      destination: secondDestination,
      amount: "250.0000001",
      asset: `USDC:${issuerA}`
    });
    expect(payload.totals[0]).toEqual({ asset: "native", total: "11.5000000", rowCount: 2 });
  });

  it("exports a duplicate-flagged file, since duplicates may be deliberate", () => {
    const result = exportRows(report(duplicateRowsCsv));
    expect(result.ok).toBe(true);
    expect(result.ok && JSON.parse(result.value).duplicateCount).toBe(2);
  });
});

describe("readCsvFile", () => {
  it("reads a text file", async () => {
    const file = new File([validCsv], "payout.csv", { type: "text/csv" });
    await expect(readCsvFile(file)).resolves.toEqual({ ok: true, value: validCsv });
  });

  it("rejects an empty file", async () => {
    const file = new File([], "payout.csv", { type: "text/csv" });
    await expect(readCsvFile(file)).resolves.toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects an oversized file before reading a single byte", async () => {
    const file = new File(["x"], "payout.csv", { type: "text/csv" });
    Object.defineProperty(file, "size", { value: MAX_FILE_BYTES + 1 });

    await expect(readCsvFile(file)).resolves.toEqual({ ok: false, code: "input_too_large" });
  });

  it("maps an unreadable file onto invalid_input rather than throwing", async () => {
    const file = new File(["x"], "payout.csv", { type: "text/csv" });
    Object.defineProperty(file, "text", {
      value: () => Promise.reject(new Error("NotReadableError"))
    });

    await expect(readCsvFile(file)).resolves.toEqual({ ok: false, code: "invalid_input" });
  });
});

describe("shouldRedact", () => {
  it("is true only for a rejected secret key", () => {
    expect(shouldRedact(["secret_key_destination"])).toBe(true);
    expect(shouldRedact(["invalid_destination"])).toBe(false);
    expect(shouldRedact([])).toBe(false);
  });
});
