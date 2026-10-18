import { Networks } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";
import {
  describeNetwork,
  formatFee,
  formatLayer,
  formatOperationType,
  formatSignatureCount,
  formatSignatureHints,
  stroopsToXlm
} from "@/features/fee-bump-inspector/lib/format";
import {
  isInputProblem,
  isWrongEnvelopeKind,
  toFeeBumpErrorCode
} from "@/features/fee-bump-inspector/lib/feeBumpInspector.errors";

describe("stroopsToXlm", () => {
  it("keeps all seven decimal places", () => {
    expect(stroopsToXlm("1")).toBe("0.0000001");
    expect(stroopsToXlm("10000000")).toBe("1.0000000");
  });

  it("does not lose stroops past Number.MAX_SAFE_INTEGER", () => {
    // 1.2e16 stroops — a float divide by 1e7 would round the tail away.
    expect(stroopsToXlm("12000000000000000")).toBe("1200000000.0000000");
  });

  it("handles zero", () => {
    expect(stroopsToXlm("0")).toBe("0.0000000");
  });
});

describe("formatFee", () => {
  it("shows stroops first and XLM alongside", () => {
    expect(formatFee("600")).toBe("600 stroops (0.0000600 XLM)");
  });
});

describe("describeNetwork", () => {
  it("names the standard passphrases", () => {
    expect(describeNetwork(Networks.PUBLIC)).toBe("Public network");
    expect(describeNetwork(Networks.TESTNET)).toBe("Testnet");
    expect(describeNetwork(Networks.FUTURENET)).toBe("Futurenet");
  });

  it("calls anything else a custom network rather than guessing", () => {
    expect(describeNetwork("Standalone Network ; February 2017")).toBe("Custom network");
  });
});

describe("formatLayer", () => {
  it("names both layers distinctly", () => {
    expect(formatLayer("outer")).toMatch(/fee bump/);
    expect(formatLayer("inner")).toMatch(/executed/);
  });
});

describe("formatSignatureHints", () => {
  it("reports an empty vector as None", () => {
    expect(formatSignatureHints({ count: 0, hints: [] })).toBe("None");
  });

  it("lists every hint in envelope order", () => {
    expect(formatSignatureHints({ count: 2, hints: ["aabbccdd", "11223344"] })).toBe(
      "aabbccdd, 11223344"
    );
  });
});

describe("formatSignatureCount", () => {
  it("uses the singular for exactly one", () => {
    expect(formatSignatureCount({ count: 1, hints: ["aabbccdd"] })).toBe("1 signature");
  });

  it("uses the plural for none and for many", () => {
    expect(formatSignatureCount({ count: 0, hints: [] })).toBe("0 signatures");
    expect(formatSignatureCount({ count: 2, hints: ["a", "b"] })).toBe("2 signatures");
  });
});

describe("formatOperationType", () => {
  it("uses a friendly label for known operations", () => {
    expect(formatOperationType("bumpSequence")).toBe("Bump sequence");
    expect(formatOperationType("invokeHostFunction")).toMatch(/Soroban/);
  });

  it("degrades readably for an operation it does not know", () => {
    expect(formatOperationType("someFutureOperation")).toBe("some future operation");
  });
});

describe("error classification", () => {
  it("separates paste problems from envelope problems", () => {
    expect(isInputProblem("empty_passphrase")).toBe(true);
    expect(isInputProblem("invalid_input")).toBe(true);
    expect(isInputProblem("not_fee_bump")).toBe(false);
    expect(isInputProblem("invalid_xdr")).toBe(false);
  });

  it("singles out the ordinary-envelope case", () => {
    expect(isWrongEnvelopeKind("not_fee_bump")).toBe(true);
    expect(isWrongEnvelopeKind("invalid_xdr")).toBe(false);
  });

  it("maps anything unexpected to an undecodable envelope", () => {
    expect(toFeeBumpErrorCode(new Error("boom"))).toBe("invalid_xdr");
  });
});
