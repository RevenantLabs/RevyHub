import { describe, expect, it } from "vitest";
import {
  amountDelta,
  balanceKey,
  diffSnapshots,
  flattenSnapshot,
  fromStroops,
  toJsonSummary,
  toStroops,
  unsupportedFieldsIn
} from "@/features/account-snapshot-diff/lib/accountSnapshotDiff";
import { parseSnapshotInput } from "@/features/account-snapshot-diff/schema";
import type { SnapshotChange, SnapshotDiff } from "@/features/account-snapshot-diff/types";
import {
  HUGE_AFTER,
  HUGE_BEFORE,
  POOL_ID,
  badAccountIdJson,
  balanceDownJson,
  baseJson,
  baseSnapshot,
  extraSigner,
  hugeBalanceAfterJson,
  hugeBalanceBeforeJson,
  limitAbsentJson,
  limitZeroJson,
  malformedJson,
  notAnAccountJson,
  oneStroopJson,
  otherAccountJson,
  otherIssuer,
  poolSharesJson,
  reorderedJson,
  sameCodeOtherIssuerJson,
  signerAddedJson,
  trustlineRemovedJson,
  unsupportedFieldJson,
  usdcIssuer
} from "@/features/account-snapshot-diff/fixtures/accountSnapshotDiff.fixture";

function diff(before: string, after: string) {
  const parsed = parseSnapshotInput({ before, after });
  if (!parsed.ok) throw new Error(`fixture failed to parse: ${parsed.code}`);
  return diffSnapshots(parsed.value);
}

function expectDiff(before: string, after: string): SnapshotDiff {
  const result = diff(before, after);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.code);
  return result.value;
}

const changed = (summary: SnapshotDiff): SnapshotChange[] =>
  summary.changes.filter((change) => change.type !== "unchanged");

const find = (summary: SnapshotDiff, key: string, field: string) =>
  summary.changes.find((change) => change.key === key && change.field === field);

describe("toStroops and fromStroops", () => {
  it("round-trip an amount exactly", () => {
    expect(fromStroops(toStroops("100.5000000"))).toBe("100.5000000");
    expect(fromStroops(toStroops("0.0000001"))).toBe("0.0000001");
  });

  it("survive values past Number.MAX_SAFE_INTEGER", () => {
    // These two amounts differ by one stroop, and `Number` collapses both to
    // the same float — which is exactly why nothing here goes through it.
    expect(Number(HUGE_BEFORE)).toBe(Number(HUGE_AFTER));
    expect(HUGE_BEFORE).not.toBe(HUGE_AFTER);

    expect(fromStroops(toStroops(HUGE_BEFORE))).toBe(HUGE_BEFORE);
    expect(toStroops(HUGE_AFTER) - toStroops(HUGE_BEFORE)).toBe(1n);
  });

  it("handle negative amounts", () => {
    expect(fromStroops(toStroops("-1.5000000"))).toBe("-1.5000000");
  });
});

describe("amountDelta", () => {
  it("computes an exact signed difference", () => {
    expect(amountDelta("100.0000000", "250.5000000")).toBe("150.5000000");
    expect(amountDelta("250.0000000", "100.0000000")).toBe("-150.0000000");
  });

  it("resolves a one-stroop move that a float would lose", () => {
    expect(amountDelta(HUGE_BEFORE, HUGE_AFTER)).toBe("0.0000001");
  });

  it("returns null when a side is absent or is not an amount", () => {
    expect(amountDelta(null, "1.0000000")).toBeNull();
    expect(amountDelta("1.0000000", null)).toBeNull();
    expect(amountDelta("true", "false")).toBeNull();
  });
});

describe("balanceKey", () => {
  it("uses full asset identity, never the code alone", () => {
    expect(balanceKey({ asset_type: "native" })).toBe("native");
    expect(
      balanceKey({ asset_type: "credit_alphanum4", asset_code: "USDC", asset_issuer: usdcIssuer })
    ).toBe(`USDC:${usdcIssuer}`);
    // Same code, different issuer — a different key, and therefore a different asset.
    expect(
      balanceKey({ asset_type: "credit_alphanum4", asset_code: "USDC", asset_issuer: otherIssuer })
    ).not.toBe(`USDC:${usdcIssuer}`);
  });

  it("keys pool shares by pool ID", () => {
    expect(
      balanceKey({ asset_type: "liquidity_pool_shares", liquidity_pool_id: POOL_ID })
    ).toBe(`pool:${POOL_ID}`);
  });
});

describe("diffSnapshots", () => {
  it("reports two identical snapshots as identical", () => {
    const summary = expectDiff(baseJson, baseJson);

    expect(summary.identical).toBe(true);
    expect(summary.changedCount).toBe(0);
    expect(summary.unchangedCount).toBeGreaterThan(0);
  });

  it("ignores array order entirely", () => {
    // Horizon makes no ordering guarantee, so a reordering must not be news.
    expect(expectDiff(baseJson, reorderedJson).identical).toBe(true);
  });

  it("reports an exact delta for a balance that moved", () => {
    const summary = expectDiff(baseJson, balanceDownJson);
    const change = find(summary, `USDC:${usdcIssuer}`, "balance");

    expect(change).toMatchObject({
      type: "changed",
      before: "250.0000000",
      after: "200.0000000",
      delta: "-50.0000000"
    });
  });

  it("resolves a one-stroop movement", () => {
    const change = find(expectDiff(baseJson, oneStroopJson), "native", "balance");
    expect(change?.delta).toBe("0.0000001");
  });

  it("keeps precision beyond the safe integer range", () => {
    const summary = expectDiff(hugeBalanceBeforeJson, hugeBalanceAfterJson);
    const change = find(summary, "native", "balance");

    expect(change?.before).toBe(HUGE_BEFORE);
    expect(change?.after).toBe(HUGE_AFTER);
    expect(change?.delta).toBe("0.0000001");
  });

  it("treats same-code different-issuer assets as separate balances", () => {
    const summary = expectDiff(baseJson, sameCodeOtherIssuerJson);
    const added = changed(summary).filter((change) => change.type === "added");

    expect(added.some((change) => change.key === `USDC:${otherIssuer}`)).toBe(true);
    // The original USDC trustline is untouched.
    expect(find(summary, `USDC:${usdcIssuer}`, "balance")?.type).toBe("unchanged");
  });

  it("reports a removed trustline as removed, not as zeroed", () => {
    const summary = expectDiff(baseJson, trustlineRemovedJson);
    const change = find(summary, `USDC:${usdcIssuer}`, "balance");

    expect(change?.type).toBe("removed");
    expect(change?.after).toBeNull();
    // An absent balance has no delta — inventing one would imply a movement.
    expect(change?.delta).toBeNull();
  });

  it("distinguishes an absent field from an explicit zero", () => {
    const absent = find(expectDiff(baseJson, limitAbsentJson), `USDC:${usdcIssuer}`, "limit");
    const zero = find(expectDiff(baseJson, limitZeroJson), `USDC:${usdcIssuer}`, "limit");

    expect(absent?.type).toBe("removed");
    expect(absent?.after).toBeNull();

    expect(zero?.type).toBe("changed");
    expect(zero?.after).toBe("0.0000000");
    expect(zero?.delta).toBe("-1000.0000000");
  });

  it("reports added signers and changed thresholds in their own sections", () => {
    const summary = expectDiff(baseJson, signerAddedJson);

    expect(find(summary, extraSigner, "weight")).toMatchObject({
      type: "added",
      section: "signers"
    });
    expect(find(summary, "thresholds", "med_threshold")).toMatchObject({
      type: "changed",
      section: "thresholds",
      before: "1",
      after: "2"
    });
  });

  it("keys pool shares by pool ID rather than by an asset code", () => {
    const summary = expectDiff(baseJson, poolSharesJson);
    expect(find(summary, `pool:${POOL_ID}`, "balance")?.type).toBe("added");
  });

  it("surfaces fields it does not compare instead of hiding them", () => {
    const summary = expectDiff(baseJson, unsupportedFieldJson);

    expect(summary.unsupportedFields).toContain("some_future_field");
    // Horizon envelope noise is not reported as unsupported.
    expect(summary.unsupportedFields).not.toContain("_links");
    expect(summary.unsupportedFields).not.toContain("paging_token");
  });

  it("refuses two snapshots of different accounts", () => {
    expect(diff(baseJson, otherAccountJson)).toEqual({ ok: false, code: "account_mismatch" });
  });

  it("refuses documents that are not account snapshots", () => {
    expect(diff(notAnAccountJson, baseJson)).toEqual({ ok: false, code: "invalid_snapshot" });
    expect(diff(baseJson, badAccountIdJson)).toEqual({ ok: false, code: "invalid_snapshot" });
    expect(diff(malformedJson, baseJson)).toEqual({ ok: false, code: "invalid_snapshot" });
  });

  it("never infers a timestamp or an ordering of its own", () => {
    const summary = expectDiff(baseJson, balanceDownJson);
    // Nothing in the output claims when either observation was taken.
    expect(JSON.stringify(summary)).not.toMatch(/observedAt|timestamp|comparedAt/);
  });
});

describe("flattenSnapshot", () => {
  it("keys balances by identity rather than by position", () => {
    const map = flattenSnapshot(baseSnapshot);

    expect(map.has(`balances|USDC:${usdcIssuer}|balance`)).toBe(true);
    expect(map.has("balances|native|balance")).toBe(true);
  });

  it("skips absent fields rather than storing them as empty", () => {
    const map = flattenSnapshot({ account_id: "GA", sequence: null });
    expect(map.has("account|account|sequence")).toBe(false);
  });
});

describe("unsupportedFieldsIn", () => {
  it("ignores Horizon envelope noise", () => {
    expect(unsupportedFieldsIn({ _links: {}, id: "x", paging_token: "1" })).toEqual([]);
  });

  it("names a field it does not model", () => {
    expect(unsupportedFieldsIn({ mystery: 1 })).toEqual(["mystery"]);
  });
});

describe("toJsonSummary", () => {
  it("is byte-identical for the same pair", () => {
    expect(toJsonSummary(expectDiff(baseJson, balanceDownJson))).toBe(
      toJsonSummary(expectDiff(baseJson, balanceDownJson))
    );
  });

  it("carries the delta with each change", () => {
    const json = JSON.parse(toJsonSummary(expectDiff(baseJson, balanceDownJson)));
    const change = json.changes.find(
      (entry: { field: string }) => entry.field === "balance"
    );

    expect(change).toMatchObject({ delta: "-50.0000000", section: "balances" });
  });

  it("does not copy the snapshots into the export", () => {
    const json = toJsonSummary(expectDiff(baseJson, balanceDownJson));
    expect(json).not.toContain("_links");
    expect(json).not.toContain("home_domain");
  });
});
