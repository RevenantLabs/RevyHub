import { describe, expect, it } from "vitest";
import {
  base64Overhead,
  formatBytes,
  formatCharacters,
  formatOperationLabel,
  formatShare,
  formatSignatureLabel,
  sectionShare,
  sectionsTotal
} from "@/features/transaction-size-analyzer/lib/format";
import {
  isBudgetProblem,
  isInputProblem,
  toSizeErrorCode
} from "@/features/transaction-size-analyzer/lib/transactionSize.errors";
import type { LayerBreakdown } from "@/features/transaction-size-analyzer/types";

const layer: LayerBreakdown = {
  totalBytes: 200,
  sections: [
    { key: "envelope_discriminant", bytes: 4 },
    { key: "transaction_body", bytes: 100 },
    { key: "operations", bytes: 76 },
    { key: "signatures", bytes: 20 }
  ],
  operationCount: 1,
  signatureCount: 1,
  operationBytes: [72],
  signatureBytes: [16]
};

describe("formatBytes", () => {
  it("uses the singular for exactly one byte", () => {
    expect(formatBytes(1)).toBe("1 byte");
  });

  it("groups thousands rather than rounding to a unit", () => {
    // Rounding to "1.2 KB" would put the approximation this tool exists to
    // replace straight back on screen.
    expect(formatBytes(1234)).toBe("1,234 bytes");
    expect(formatBytes(0)).toBe("0 bytes");
  });
});

describe("formatCharacters", () => {
  it("counts characters, not bytes", () => {
    expect(formatCharacters(1)).toBe("1 character");
    expect(formatCharacters(1234)).toBe("1,234 characters");
  });
});

describe("sectionShare", () => {
  it("reports a whole-percentage share of the layer", () => {
    expect(sectionShare({ key: "operations", bytes: 50 }, 200)).toBe(25);
    expect(formatShare({ key: "operations", bytes: 50 }, 200)).toBe("25%");
  });

  it("returns zero rather than dividing by zero", () => {
    expect(sectionShare({ key: "operations", bytes: 0 }, 0)).toBe(0);
  });
});

describe("base64Overhead", () => {
  it("reports how much of the string is encoding", () => {
    expect(base64Overhead(248, 332)).toBe(84);
  });
});

describe("sectionsTotal", () => {
  it("adds the sections so the sum can be shown beside them", () => {
    expect(sectionsTotal(layer)).toBe(200);
    expect(sectionsTotal(layer)).toBe(layer.totalBytes);
  });

  it("is zero when the breakdown was withheld", () => {
    expect(sectionsTotal({ ...layer, sections: [] })).toBe(0);
  });
});

describe("element labels", () => {
  it("numbers operations and signatures from one", () => {
    expect(formatOperationLabel(0, 72)).toBe("Operation 1 — 72 bytes");
    expect(formatSignatureLabel(1, 16)).toBe("Signature 2 — 16 bytes");
  });
});

describe("error classification", () => {
  it("separates input problems from envelope problems", () => {
    expect(isInputProblem("invalid_budget")).toBe(true);
    expect(isInputProblem("empty_input")).toBe(true);
    expect(isInputProblem("invalid_xdr")).toBe(false);
  });

  it("singles out the budget field", () => {
    expect(isBudgetProblem("invalid_budget")).toBe(true);
    expect(isBudgetProblem("invalid_input")).toBe(false);
  });

  it("maps anything unexpected to an undecodable envelope", () => {
    expect(toSizeErrorCode(new Error("boom"))).toBe("invalid_xdr");
  });
});
