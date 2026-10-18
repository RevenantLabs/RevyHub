import { describe, expect, it } from "vitest";
import {
  MAX_CSV_LENGTH,
  OPTIONAL_HEADERS,
  parsePreflightInput,
  readHeaders,
  REQUIRED_HEADERS
} from "@/features/payment-csv-preflight/schema";
import { validCsv } from "@/features/payment-csv-preflight/fixtures/paymentCsvPreflight.fixture";

describe("parsePreflightInput", () => {
  it("accepts pasted CSV text", () => {
    expect(parsePreflightInput(validCsv)).toEqual({ ok: true, value: { csv: validCsv } });
  });

  it("trims surrounding whitespace", () => {
    expect(parsePreflightInput(`\n  ${validCsv}\n\n`)).toEqual({
      ok: true,
      value: { csv: validCsv }
    });
  });

  it("rejects empty and whitespace-only input", () => {
    expect(parsePreflightInput("")).toEqual({ ok: false, code: "empty_input" });
    expect(parsePreflightInput("   \n\t ")).toEqual({ ok: false, code: "empty_input" });
  });

  it("accepts input at the character bound and rejects one character more", () => {
    const atBound = "d".repeat(MAX_CSV_LENGTH);
    expect(parsePreflightInput(atBound).ok).toBe(true);
    expect(parsePreflightInput(`${atBound}d`)).toEqual({ ok: false, code: "input_too_large" });
  });

  it("rejects binary content that only looks like text", () => {
    const withNul = `destination${String.fromCharCode(0)}amount`;
    expect(parsePreflightInput(withNul)).toEqual({ ok: false, code: "invalid_input" });
  });

  it("does not reject the whole file for a secret key inside it", () => {
    // A seed belongs to one row; failing the import would hide which row.
    expect(parsePreflightInput("destination\nSABC").ok).toBe(true);
  });
});

describe("readHeaders", () => {
  it("maps every required and optional column to its position", () => {
    const result = readHeaders([...REQUIRED_HEADERS, ...OPTIONAL_HEADERS]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.columns.get("destination")).toBe(0);
    expect(result.value.columns.get("memo_value")).toBe(5);
    expect(result.value.optionalColumns).toEqual([...OPTIONAL_HEADERS]);
  });

  it("accepts headers in any order", () => {
    const result = readHeaders(["amount", "asset_issuer", "destination", "asset_code"]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.columns.get("destination")).toBe(2);
    expect(result.value.optionalColumns).toEqual([]);
  });

  it("normalises case and spacing in header names", () => {
    const result = readHeaders(["Destination", " AMOUNT ", "Asset Code", "asset issuer"]);
    expect(result.ok).toBe(true);
  });

  it("ignores an unknown column rather than failing on it", () => {
    const result = readHeaders([...REQUIRED_HEADERS, "notes"]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.optionalColumns).toEqual([]);
  });

  it("rejects a repeated header instead of guessing which column was meant", () => {
    expect(readHeaders([...REQUIRED_HEADERS, "amount"])).toEqual({
      ok: false,
      code: "invalid_headers"
    });
  });

  it("rejects a repeated header even when it is an unknown column", () => {
    expect(readHeaders([...REQUIRED_HEADERS, "notes", "notes"])).toEqual({
      ok: false,
      code: "invalid_headers"
    });
  });

  it("rejects a missing required header", () => {
    for (const header of REQUIRED_HEADERS) {
      const fields = REQUIRED_HEADERS.filter((name) => name !== header);
      expect(readHeaders([...fields])).toEqual({ ok: false, code: "invalid_headers" });
    }
  });

  it("skips an empty header cell, which a trailing comma leaves behind", () => {
    expect(readHeaders([...REQUIRED_HEADERS, "", ""]).ok).toBe(true);
  });
});
