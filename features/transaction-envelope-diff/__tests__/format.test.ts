import { describe, expect, it } from "vitest";
import {
  countByStatus,
  entriesInSection,
  filterEntries,
  formatSide,
  occupiedSections,
  statusTone
} from "@/features/transaction-envelope-diff/lib/format";
import {
  isInputProblem,
  isSideProblem,
  toDiffErrorCode
} from "@/features/transaction-envelope-diff/lib/envelopeDiff.errors";
import type { DiffEntry } from "@/features/transaction-envelope-diff/types";

const entry = (over: Partial<DiffEntry> = {}): DiffEntry => ({
  path: "tx.fee",
  section: "body",
  layer: "envelope",
  before: "100",
  after: "100",
  status: "unchanged",
  ...over
});

const entries: DiffEntry[] = [
  entry({ path: "envelopeType", section: "envelope" }),
  entry({ path: "tx.fee", after: "200", status: "changed" }),
  entry({ path: "tx.operations[0].amount", section: "operations" }),
  entry({
    path: "tx.signatures[0].hint",
    section: "signatures",
    before: null,
    status: "added"
  })
];

describe("filterEntries", () => {
  it("returns everything for the all filter", () => {
    expect(filterEntries(entries, "all")).toHaveLength(4);
  });

  it("keeps only rows that moved", () => {
    expect(filterEntries(entries, "changed").map((item) => item.path)).toEqual([
      "tx.fee",
      "tx.signatures[0].hint"
    ]);
  });

  it("keeps only rows that did not move", () => {
    expect(filterEntries(entries, "unchanged")).toHaveLength(2);
  });

  it("does not mutate the list it was given", () => {
    const before = [...entries];
    filterEntries(entries, "changed");
    expect(entries).toEqual(before);
  });
});

describe("occupiedSections", () => {
  it("lists only sections that have rows, in reading order", () => {
    expect(occupiedSections(entries)).toEqual([
      "envelope",
      "body",
      "operations",
      "signatures"
    ]);
  });

  it("omits a section with nothing in it", () => {
    expect(occupiedSections(filterEntries(entries, "changed"))).toEqual([
      "body",
      "signatures"
    ]);
  });

  it("returns nothing for an empty list", () => {
    expect(occupiedSections([])).toEqual([]);
  });
});

describe("entriesInSection", () => {
  it("picks out one section's rows", () => {
    expect(entriesInSection(entries, "signatures")).toHaveLength(1);
  });
});

describe("formatSide", () => {
  it("shows an absent field as an em dash, not as a blank", () => {
    expect(formatSide(null)).toBe("—");
  });

  it("names an empty string rather than rendering nothing", () => {
    expect(formatSide("")).toBe("(empty)");
  });

  it("passes an ordinary value through", () => {
    expect(formatSide("100")).toBe("100");
  });
});

describe("statusTone", () => {
  it("gives each status a distinct tone", () => {
    expect(statusTone("unchanged")).toBe("muted");
    expect(statusTone("changed")).toBe("warning");
    expect(statusTone("added")).toBe("success");
    expect(statusTone("removed")).toBe("danger");
  });
});

describe("countByStatus", () => {
  it("counts each status separately", () => {
    expect(countByStatus(entries, "unchanged")).toBe(2);
    expect(countByStatus(entries, "changed")).toBe(1);
    expect(countByStatus(entries, "added")).toBe(1);
    expect(countByStatus(entries, "removed")).toBe(0);
  });
});

describe("error classification", () => {
  it("separates side-specific problems from input problems", () => {
    expect(isSideProblem("invalid_left_xdr")).toBe(true);
    expect(isSideProblem("empty_input")).toBe(false);
    expect(isInputProblem("input_too_large")).toBe(true);
    expect(isInputProblem("invalid_right_xdr")).toBe(false);
  });

  it("attributes anything unexpected to the before envelope", () => {
    expect(toDiffErrorCode(new Error("boom"))).toBe("invalid_left_xdr");
  });
});
