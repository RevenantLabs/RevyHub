import { describe, expect, it } from "vitest";
import {
  describeTimeBounds,
  formatMemo,
  formatOperationType,
  formatTimeBound,
  formatVariant,
  isExpired
} from "@/features/xdr-inspector/lib/format";
import { isInputProblem } from "@/features/xdr-inspector/lib/xdrInspector.errors";

describe("formatTimeBound", () => {
  it("renders zero as unbounded rather than as 1970", () => {
    expect(formatTimeBound("0")).toBe("Unbounded");
  });

  it("renders a Unix second as a readable UTC timestamp", () => {
    expect(formatTimeBound("1700000000")).toBe("2023-11-14 22:13:20 UTC");
  });
});

describe("describeTimeBounds", () => {
  it("says an envelope without bounds is valid indefinitely", () => {
    expect(describeTimeBounds(null)).toMatch(/indefinitely/);
  });

  it("shows both ends of a bounded window", () => {
    expect(describeTimeBounds({ minTime: "0", maxTime: "1700000000" })).toBe(
      "Unbounded → 2023-11-14 22:13:20 UTC"
    );
  });
});

describe("isExpired", () => {
  const now = 1_800_000_000_000;

  it("flags a window whose upper bound has passed", () => {
    expect(isExpired({ minTime: "0", maxTime: "1700000000" }, now)).toBe(true);
  });

  it("does not flag a window that is still open", () => {
    expect(isExpired({ minTime: "0", maxTime: "1900000000" }, now)).toBe(false);
  });

  it("does not treat an unbounded upper limit as expired", () => {
    expect(isExpired({ minTime: "0", maxTime: "0" }, now)).toBe(false);
    expect(isExpired(null, now)).toBe(false);
  });
});

describe("formatMemo", () => {
  it("reports an absent memo as None", () => {
    expect(formatMemo({ type: "none", value: null })).toBe("None");
  });

  it("shows the value with its type", () => {
    expect(formatMemo({ type: "text", value: "Invoice 1001" })).toBe("Invoice 1001 (text)");
  });
});

describe("formatOperationType", () => {
  it("uses a friendly label for known operations", () => {
    expect(formatOperationType("pathPaymentStrictSend")).toBe("Path payment (strict send)");
    expect(formatOperationType("invokeHostFunction")).toMatch(/Soroban/);
  });

  it("degrades readably for an operation it does not know", () => {
    expect(formatOperationType("someFutureOperation")).toBe("some future operation");
  });
});

describe("formatVariant", () => {
  it("names each envelope variant", () => {
    expect(formatVariant("classic-v0")).toMatch(/v0/);
    expect(formatVariant("classic-v1")).toMatch(/v1/);
    expect(formatVariant("fee-bump")).toMatch(/Fee-bump/);
  });
});

describe("isInputProblem", () => {
  it("separates paste problems from envelope problems", () => {
    expect(isInputProblem("invalid_base64")).toBe(true);
    expect(isInputProblem("empty_input")).toBe(true);
    expect(isInputProblem("malformed_envelope")).toBe(false);
  });
});
