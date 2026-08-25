import { describe, expect, it } from "vitest";
import {
  formatFee,
  formatMemo,
  formatOperationType,
  formatTimestamp,
  stroopsToXlm
} from "@/features/transaction-lookup/lib/format";

describe("stroopsToXlm", () => {
  it("converts using integer arithmetic", () => {
    expect(stroopsToXlm("100")).toBe("0.00001");
    expect(stroopsToXlm("10000000")).toBe("1");
    expect(stroopsToXlm("0")).toBe("0");
  });

  it("stays exact beyond the float safe range", () => {
    expect(stroopsToXlm("9223372036854775807")).toBe("922337203685.4775807");
  });
});

describe("formatFee", () => {
  it("shows stroops and XLM together", () => {
    expect(formatFee("100")).toBe("100 stroops (0.00001 XLM)");
  });
});

describe("formatOperationType", () => {
  it("uses a friendly label for known operations", () => {
    expect(formatOperationType("path_payment_strict_send")).toBe("Path payment (strict send)");
    expect(formatOperationType("invoke_host_function")).toMatch(/Soroban/);
  });

  it("falls back to a readable form for unknown operations", () => {
    expect(formatOperationType("some_new_operation")).toBe("some new operation");
  });
});

describe("formatMemo", () => {
  it("reports an absent memo as None", () => {
    expect(formatMemo("none")).toBe("None");
    expect(formatMemo("text", undefined)).toBe("None");
  });

  it("shows the memo value with its type", () => {
    expect(formatMemo("text", "Invoice 1001")).toBe("Invoice 1001 (text)");
  });
});

describe("formatTimestamp", () => {
  it("renders an ISO timestamp readably", () => {
    expect(formatTimestamp("2026-05-02T10:14:05Z")).toBe("2026-05-02 10:14:05 UTC");
  });

  it("passes an unparseable value through", () => {
    expect(formatTimestamp("not a date")).toBe("not a date");
  });
});
