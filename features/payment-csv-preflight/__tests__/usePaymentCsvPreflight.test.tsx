import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { usePaymentCsvPreflight } from "@/features/payment-csv-preflight/hooks/usePaymentCsvPreflight";
import {
  duplicateRowsCsv,
  firstDestination,
  invalidRowsCsv,
  paymentCsvPreflightFixture,
  secretKeyRowCsv,
  secretSeed,
  unterminatedQuoteCsv,
  validCsv
} from "@/features/payment-csv-preflight/fixtures/paymentCsvPreflight.fixture";

function csvFile(contents: string, name = "payout.csv") {
  return new File([contents], name, { type: "text/csv" });
}

/** Lets every pending microtask and timer callback run. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("usePaymentCsvPreflight", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => usePaymentCsvPreflight());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("reports a successful run against pasted text", () => {
    const { result } = renderHook(() => usePaymentCsvPreflight());

    act(() => result.current.submitText(validCsv));

    expect(result.current.state).toEqual({
      status: "success",
      report: paymentCsvPreflightFixture,
      source: { kind: "text" }
    });
  });

  it("keeps invalid rows in a successful report rather than failing", () => {
    const { result } = renderHook(() => usePaymentCsvPreflight());

    act(() => result.current.submitText(invalidRowsCsv));

    expect(result.current.state.status).toBe("success");
    expect(result.current.state).toMatchObject({ report: { validCount: 0, invalidCount: 7 } });
  });

  it("reports empty input as an error", () => {
    const { result } = renderHook(() => usePaymentCsvPreflight());

    act(() => result.current.submitText("   "));

    expect(result.current.state).toEqual({ status: "error", code: "empty_input" });
  });

  it("carries the line number of a malformed CSV", () => {
    const { result } = renderHook(() => usePaymentCsvPreflight());

    act(() => result.current.submitText(unterminatedQuoteCsv));

    expect(result.current.state).toEqual({ status: "error", code: "invalid_csv", detail: 2 });
  });

  it("names the file it read", async () => {
    const { result } = renderHook(() => usePaymentCsvPreflight());

    await act(async () => {
      await result.current.submitFile(csvFile(duplicateRowsCsv, "january.csv"));
    });

    expect(result.current.state).toMatchObject({
      status: "success",
      source: { kind: "file", name: "january.csv" }
    });
  });

  it("shows a loading state while a file is being read", async () => {
    const { result } = renderHook(() => usePaymentCsvPreflight());

    let release: (() => void) | undefined;
    const file = csvFile(validCsv);
    Object.defineProperty(file, "text", {
      value: () =>
        new Promise<string>((resolve) => {
          release = () => resolve(validCsv);
        })
    });

    act(() => void result.current.submitFile(file));
    expect(result.current.state).toEqual({ status: "loading" });

    act(() => release?.());
    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });

  it("never lets a slow earlier read overwrite a newer result", async () => {
    const { result } = renderHook(() => usePaymentCsvPreflight());

    let releaseSlow: (() => void) | undefined;
    const slow = csvFile(duplicateRowsCsv, "slow.csv");
    Object.defineProperty(slow, "text", {
      value: () =>
        new Promise<string>((resolve) => {
          releaseSlow = () => resolve(duplicateRowsCsv);
        })
    });

    act(() => void result.current.submitFile(slow));
    act(() => result.current.submitText(validCsv));

    expect(result.current.state).toMatchObject({ source: { kind: "text" } });

    // The first read finishes last, and must be ignored.
    await act(async () => {
      releaseSlow?.();
      await flush();
    });

    expect(result.current.state).toMatchObject({
      status: "success",
      source: { kind: "text" },
      report: { rows: paymentCsvPreflightFixture.rows }
    });
  });

  it("rejects an empty file before reading it", async () => {
    const { result } = renderHook(() => usePaymentCsvPreflight());

    await act(async () => {
      await result.current.submitFile(csvFile(""));
    });

    expect(result.current.state).toEqual({ status: "error", code: "empty_input" });
  });

  it("never carries a secret key into state", () => {
    const { result } = renderHook(() => usePaymentCsvPreflight());

    act(() => result.current.submitText(secretKeyRowCsv));

    expect(result.current.state.status).toBe("success");
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => usePaymentCsvPreflight());

    act(() => result.current.submitText(validCsv));
    act(() => result.current.reset());

    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("discards an in-flight read when reset is called", async () => {
    const { result } = renderHook(() => usePaymentCsvPreflight());

    let release: (() => void) | undefined;
    const file = csvFile(validCsv);
    Object.defineProperty(file, "text", {
      value: () =>
        new Promise<string>((resolve) => {
          release = () => resolve(`destination,amount,asset_code,asset_issuer\n${firstDestination},1,XLM,`);
        })
    });

    act(() => void result.current.submitFile(file));
    act(() => result.current.reset());

    await act(async () => {
      release?.();
      await flush();
    });

    expect(result.current.state).toEqual({ status: "idle" });
  });
});
