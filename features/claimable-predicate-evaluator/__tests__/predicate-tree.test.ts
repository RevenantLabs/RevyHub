import { describe, expect, it } from "vitest";
import { xdr } from "@stellar/stellar-sdk";
import { decodeJsonPredicate, decodePredicateXdr, MAX_DEPTH, MAX_NODES } from "@/features/claimable-predicate-evaluator/lib/predicate-tree";
import { predicateXdr } from "@/features/claimable-predicate-evaluator/fixtures/normal.fixture";
describe("predicate decoding", () => {
  it("decodes all six protocol arms from JSON", () => {
    for (const source of [{ unconditional: true }, { abs_before_epoch: "1795435200" }, { rel_before: "60" }, { rel_before: 60 }, { not: { unconditional: true } }, { and: [{ unconditional: true }, { unconditional: true }] }, { or: [{ unconditional: true }, { unconditional: true }] }]) expect(decodeJsonPredicate(source).ok).toBe(true);
    expect(decodePredicateXdr(predicateXdr)).toMatchObject({ ok: true, value: { kind: "not" } });
    expect(decodeJsonPredicate({ abs_before: "2026-11-23T12:00:00Z", abs_before_epoch: "1795435200" }).ok).toBe(true);
    expect(decodeJsonPredicate({ abs_before: "2026-11-23T12:00:00Z", abs_before_epoch: "1795435201" }).ok).toBe(false);
    expect(decodeJsonPredicate({ abs_before: "1969-12-31T23:59:59Z" })).toEqual({ ok: false, code: "malformed_data" });
  });
  it("decodes every XDR arm through the installed SDK", () => {
    const unconditional = xdr.ClaimPredicate.claimPredicateUnconditional();
    const absolute = xdr.ClaimPredicate.claimPredicateBeforeAbsoluteTime(xdr.Int64.fromString("100"));
    const relative = xdr.ClaimPredicate.claimPredicateBeforeRelativeTime(xdr.Int64.fromString("60"));
    const variants = [
      [unconditional, "unconditional"],
      [absolute, "abs_before"],
      [relative, "rel_before"],
      [xdr.ClaimPredicate.claimPredicateNot(absolute), "not"],
      [xdr.ClaimPredicate.claimPredicateAnd([unconditional, relative]), "and"],
      [xdr.ClaimPredicate.claimPredicateOr([absolute, relative]), "or"]
    ] as const;
    for (const [node, kind] of variants) {
      expect(decodePredicateXdr(node.toXDR("base64"))).toMatchObject({ ok: true, value: { kind } });
    }
  });
  it("rejects malformed unions and unknown arms", () => {
    for (const source of [{}, { unconditional: true, rel_before: "1" }, { and: [{}] }, { not: null }, { rel_before: "-1" }, { rel_before: Number.MAX_SAFE_INTEGER + 1 }, { rel_before: "9223372036854775808" }]) expect(decodeJsonPredicate(source).ok).toBe(false);
    expect(decodeJsonPredicate({ after: "1" })).toEqual({ ok: false, code: "unsupported_variant" });
    expect(decodePredicateXdr("AAAA").ok).toBe(false);
  });
  it("bounds depth and node count", () => {
    let deep: unknown = { unconditional: true };
    for (let i = 0; i <= MAX_DEPTH; i++) deep = { not: deep };
    expect(decodeJsonPredicate(deep)).toEqual({ ok: false, code: "too_large" });
    let wide: unknown = { unconditional: true };
    for (let i = 0; i < 7; i++) wide = { and: [wide, wide] };
    expect(decodeJsonPredicate(wide)).toEqual({ ok: false, code: "too_large" });
    expect(MAX_NODES).toBe(128);
  });
  it("rejects a nullable NOT arm from XDR", () => expect(decodePredicateXdr(xdr.ClaimPredicate.claimPredicateNot(null).toXDR("base64"))).toEqual({ ok: false, code: "malformed_data" }));
});
