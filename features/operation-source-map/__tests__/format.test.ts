import { describe, expect, it } from "vitest";
import {
  filterOperations,
  formatIndex,
  formatOperationIndexes,
  formatOperationType,
  formatOriginCounts
} from "@/features/operation-source-map/lib/format";
import {
  isInputProblem,
  isUnsupportedEnvelope,
  toSourceMapErrorCode
} from "@/features/operation-source-map/lib/operationSourceMap.errors";
import type { OperationSource, SourceGroup } from "@/features/operation-source-map/types";

const identity = (address: string) => ({ address, baseAddress: null, muxedId: null });

const operations: OperationSource[] = [
  {
    index: 0,
    type: "payment",
    explicitSource: null,
    effectiveSource: identity("GA"),
    inherited: true
  },
  {
    index: 1,
    type: "bumpSequence",
    explicitSource: identity("GB"),
    effectiveSource: identity("GB"),
    inherited: false
  },
  {
    index: 2,
    type: "payment",
    explicitSource: null,
    effectiveSource: identity("GA"),
    inherited: true
  }
];

describe("filterOperations", () => {
  it("returns everything for the all filter", () => {
    expect(filterOperations(operations, "all")).toHaveLength(3);
  });

  it("keeps only inherited rows", () => {
    expect(filterOperations(operations, "inherited").map((o) => o.index)).toEqual([0, 2]);
  });

  it("keeps only overridden rows", () => {
    expect(filterOperations(operations, "overridden").map((o) => o.index)).toEqual([1]);
  });

  it("returns an empty list rather than throwing when nothing matches", () => {
    const allInherited = operations.filter((operation) => operation.inherited);
    expect(filterOperations(allInherited, "overridden")).toEqual([]);
  });

  it("does not mutate the list it was given", () => {
    const before = [...operations];
    filterOperations(operations, "overridden");
    expect(operations).toEqual(before);
  });
});

describe("formatIndex", () => {
  it("numbers operations from one while indexes stay zero-based", () => {
    expect(formatIndex(0)).toBe("1");
    expect(formatIndex(9)).toBe("10");
  });
});

describe("formatOperationIndexes", () => {
  it("lists a group's operations in envelope order", () => {
    const group: SourceGroup = {
      source: identity("GA"),
      operationIndexes: [0, 2, 5],
      inheritedCount: 3,
      overriddenCount: 0
    };
    expect(formatOperationIndexes(group)).toBe("1, 3, 6");
  });
});

describe("formatOriginCounts", () => {
  it("shows overridden first, then inherited", () => {
    expect(
      formatOriginCounts({
        source: identity("GA"),
        operationIndexes: [0, 1],
        inheritedCount: 1,
        overriddenCount: 1
      })
    ).toBe("1 overridden · 1 inherited");
  });

  it("omits a zero count rather than printing it", () => {
    expect(
      formatOriginCounts({
        source: identity("GA"),
        operationIndexes: [0],
        inheritedCount: 1,
        overriddenCount: 0
      })
    ).toBe("1 inherited");
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
    expect(isInputProblem("invalid_input")).toBe(true);
    expect(isInputProblem("unsupported_envelope")).toBe(false);
  });

  it("singles out an envelope variant it cannot map", () => {
    expect(isUnsupportedEnvelope("unsupported_envelope")).toBe(true);
    expect(isUnsupportedEnvelope("invalid_xdr")).toBe(false);
  });

  it("maps anything unexpected to an undecodable envelope", () => {
    expect(toSourceMapErrorCode(new Error("boom"))).toBe("invalid_xdr");
  });
});
