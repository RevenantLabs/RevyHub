import { Networks } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";
import {
  describeNetwork,
  formatFee,
  formatInnerIdentityReason,
  formatOperationCount,
  formatOuterFeeDelta,
  formatSignatureCount,
  stroopsToXlm,
  truncateHash
} from "@/features/fee-bump-replacement-comparator/lib/format";
import {
  isInputProblem,
  isUnsupportedVariant,
  toFeeBumpReplacementComparatorErrorCode
} from "@/features/fee-bump-replacement-comparator/lib/feeBumpReplacementComparator.errors";
import type { OuterFeeComparisonResult } from "@/features/fee-bump-replacement-comparator/types";

const sampleOuter: OuterFeeComparisonResult = {
  leftOuterFee: "600",
  rightOuterFee: "900",
  leftFeeSource: "GLEFT",
  rightFeeSource: "GRIGHT",
  leftOuterSignatureCount: 1,
  rightOuterSignatureCount: 1,
  leftInnerOperationCount: 2,
  rightInnerOperationCount: 2,
  feeDelta: "300",
  feeIncreased: true,
  feeDecreased: false,
  feeUnchanged: false,
  sameFeeSource: false
};

describe("stroopsToXlm", () => {
  it("keeps all seven decimal places", () => {
    expect(stroopsToXlm("1")).toBe("0.0000001");
    expect(stroopsToXlm("10000000")).toBe("1.0000000");
  });

  it("does not lose stroops past Number.MAX_SAFE_INTEGER", () => {
    expect(stroopsToXlm("12000000000000000")).toBe("1200000000.0000000");
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

describe("format helpers", () => {
  it("formats signature and operation counts", () => {
    expect(formatSignatureCount(1)).toBe("1 signature");
    expect(formatSignatureCount(0)).toBe("0 signatures");
    expect(formatOperationCount(2)).toBe("2 operations");
  });

  it("formats fee deltas and identity reasons", () => {
    expect(formatOuterFeeDelta(sampleOuter)).toBe("+300 stroops");
    expect(formatInnerIdentityReason("equivalent")).toBe("equivalent");
    expect(formatInnerIdentityReason("hash_mismatch")).toMatch(/hashes/);
  });

  it("truncates long hashes without losing identity ends", () => {
    const hash = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    expect(truncateHash(hash)).toBe("01234567…89abcdef");
  });
});

describe("error classification", () => {
  it("separates paste problems from envelope problems", () => {
    expect(isInputProblem("empty_input")).toBe(true);
    expect(isInputProblem("invalid_input")).toBe(true);
    expect(isInputProblem("too_large")).toBe(true);
    expect(isInputProblem("unsupported_variant")).toBe(false);
    expect(isInputProblem("malformed_data")).toBe(false);
  });

  it("singles out the ordinary-envelope case", () => {
    expect(isUnsupportedVariant("unsupported_variant")).toBe(true);
    expect(isUnsupportedVariant("malformed_data")).toBe(false);
  });

  it("maps anything unexpected to malformed data", () => {
    expect(toFeeBumpReplacementComparatorErrorCode(new Error("boom"))).toBe("malformed_data");
  });
});
