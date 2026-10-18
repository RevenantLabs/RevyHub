import { describe, expect, it } from "vitest";
import {
  changesInSection,
  filterChanges,
  formatAmount,
  formatBalanceKey,
  formatDelta,
  formatValue,
  groupByKey,
  occupiedSections
} from "@/features/account-snapshot-diff/lib/format";
import {
  isInputProblem,
  isMismatch,
  toSnapshotErrorCode
} from "@/features/account-snapshot-diff/lib/accountSnapshotDiff.errors";
import type { SnapshotChange } from "@/features/account-snapshot-diff/types";

const change = (over: Partial<SnapshotChange> = {}): SnapshotChange => ({
  section: "balances",
  key: "native",
  field: "balance",
  before: "1.0000000",
  after: "1.0000000",
  delta: null,
  type: "unchanged",
  ...over
});

const changes: SnapshotChange[] = [
  change({ section: "account", key: "account", field: "sequence", type: "changed" }),
  change({ key: "native", field: "balance", type: "changed", delta: "-1.0000000" }),
  change({ key: "USDC:GA", field: "balance" }),
  change({ section: "signers", key: "GB", field: "weight", type: "added", before: null })
];

describe("formatAmount", () => {
  it("groups thousands and trims trailing zeros without rounding", () => {
    expect(formatAmount("1234567.5000000")).toBe("1,234,567.5");
    expect(formatAmount("0.0000001")).toBe("0.0000001");
    expect(formatAmount("100.0000000")).toBe("100");
  });

  it("keeps a negative sign in front of the grouping", () => {
    expect(formatAmount("-1234.5000000")).toBe("-1,234.5");
  });
});

describe("formatDelta", () => {
  it("always carries a sign so an increase is unmistakable", () => {
    expect(formatDelta("50.0000000")).toBe("+50");
    expect(formatDelta("-50.0000000")).toBe("-50");
    expect(formatDelta("0.0000001")).toBe("+0.0000001");
  });
});

describe("formatValue", () => {
  it("shows an absent field as an em dash, never as zero", () => {
    expect(formatValue(null)).toBe("—");
  });

  it("names an empty string rather than rendering nothing", () => {
    expect(formatValue("")).toBe("(empty)");
  });

  it("passes an explicit zero straight through", () => {
    expect(formatValue("0")).toBe("0");
  });
});

describe("filterChanges", () => {
  it("returns everything when both filters are open", () => {
    expect(filterChanges(changes, "all", "all")).toHaveLength(4);
  });

  it("narrows by section", () => {
    expect(filterChanges(changes, "signers", "all")).toHaveLength(1);
  });

  it("narrows by change type", () => {
    expect(filterChanges(changes, "all", "changed")).toHaveLength(3);
    expect(filterChanges(changes, "all", "unchanged")).toHaveLength(1);
  });

  it("applies both filters together", () => {
    expect(filterChanges(changes, "balances", "unchanged")).toHaveLength(1);
    expect(filterChanges(changes, "signers", "unchanged")).toHaveLength(0);
  });

  it("does not mutate the list it was given", () => {
    const before = [...changes];
    filterChanges(changes, "balances", "changed");
    expect(changes).toEqual(before);
  });
});

describe("occupiedSections", () => {
  it("lists only sections that have rows, in reading order", () => {
    expect(occupiedSections(changes)).toEqual(["account", "balances", "signers"]);
  });

  it("returns nothing for an empty list", () => {
    expect(occupiedSections([])).toEqual([]);
  });
});

describe("changesInSection and groupByKey", () => {
  it("groups a section's rows by identity, in first-seen order", () => {
    const groups = groupByKey(changesInSection(changes, "balances"));
    expect([...groups.keys()]).toEqual(["native", "USDC:GA"]);
    expect(groups.get("native")).toHaveLength(1);
  });
});

describe("formatBalanceKey", () => {
  it("names the native asset", () => {
    expect(formatBalanceKey("native")).toBe("XLM (native)");
  });

  it("keeps the issuer visible on a credit asset", () => {
    expect(formatBalanceKey("USDC:GABC")).toBe("USDC:GABC");
  });

  it("labels pool shares by their pool ID", () => {
    expect(formatBalanceKey("pool:abc123")).toBe("Liquidity pool abc123");
  });
});

describe("error classification", () => {
  it("separates paste problems from snapshot problems", () => {
    expect(isInputProblem("input_too_large")).toBe(true);
    expect(isInputProblem("invalid_snapshot")).toBe(false);
  });

  it("singles out two snapshots of different accounts", () => {
    expect(isMismatch("account_mismatch")).toBe(true);
    expect(isMismatch("invalid_snapshot")).toBe(false);
  });

  it("maps anything unexpected to an unsupported snapshot", () => {
    expect(toSnapshotErrorCode(new Error("boom"))).toBe("invalid_snapshot");
  });
});
