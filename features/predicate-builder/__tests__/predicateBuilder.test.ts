import { xdr } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";
import { buildPredicate } from "@/features/predicate-builder/lib/predicateBuilder";
import {
  absoluteTimestamp,
  andPredicate,
  beforeAbsolutePredicate,
  beforeRelativePredicate,
  nestedPredicate,
  notPredicate,
  orPredicate,
  unconditionalPredicate
} from "@/features/predicate-builder/fixtures/predicateBuilder.fixture";

describe("buildPredicate", () => {
  it("encodes unconditional predicate", () => {
    const result = buildPredicate({ predicate: unconditionalPredicate });
    
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    
    expect(result.value.xdrBase64).toBe(
      xdr.ClaimPredicate.claimPredicateUnconditional().toXDR("base64")
    );
    expect(result.value.plainLanguage).toBe("the balance can be claimed at any time");
  });

  it("encodes before_absolute predicate", () => {
    const result = buildPredicate({ predicate: beforeAbsolutePredicate });
    
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    
    const expected = xdr.ClaimPredicate.claimPredicateBeforeAbsoluteTime(
      xdr.Int64.fromString(String(absoluteTimestamp))
    ).toXDR("base64");
    
    expect(result.value.xdrBase64).toBe(expected);
    expect(result.value.plainLanguage).toContain("before 2027-01-01 00:00:00 UTC");
  });

  it("encodes before_relative predicate", () => {
    const result = buildPredicate({ predicate: beforeRelativePredicate });
    
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    
    const expected = xdr.ClaimPredicate.claimPredicateBeforeRelativeTime(
      xdr.Int64.fromString("86400")
    ).toXDR("base64");
    
    expect(result.value.xdrBase64).toBe(expected);
    expect(result.value.plainLanguage).toContain("within 1 day after the balance was created");
  });

  it("encodes AND predicate", () => {
    const result = buildPredicate({ predicate: andPredicate });
    
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    
    const p1 = xdr.ClaimPredicate.claimPredicateUnconditional();
    const p2 = xdr.ClaimPredicate.claimPredicateBeforeAbsoluteTime(
      xdr.Int64.fromString(String(absoluteTimestamp))
    );
    const expected = xdr.ClaimPredicate.claimPredicateAnd([p1, p2]).toXDR("base64");
    
    expect(result.value.xdrBase64).toBe(expected);
    expect(result.value.plainLanguage).toContain("AND");
  });

  it("encodes OR predicate", () => {
    const result = buildPredicate({ predicate: orPredicate });
    
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    
    expect(result.value.plainLanguage).toContain("OR");
  });

  it("encodes NOT predicate", () => {
    const result = buildPredicate({ predicate: notPredicate });
    
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    
    const inner = xdr.ClaimPredicate.claimPredicateUnconditional();
    const expected = xdr.ClaimPredicate.claimPredicateNot(inner).toXDR("base64");
    
    expect(result.value.xdrBase64).toBe(expected);
    expect(result.value.plainLanguage).toContain("NOT");
  });

  it("encodes nested predicates correctly", () => {
    const result = buildPredicate({ predicate: nestedPredicate });
    
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    
    // Just verify it encodes without error and contains expected keywords
    expect(result.value.xdrBase64.length).toBeGreaterThan(0);
    expect(result.value.plainLanguage).toContain("AND");
    expect(result.value.plainLanguage).toContain("OR");
    expect(result.value.plainLanguage).toContain("NOT");
  });

  it("produces deterministic XDR output", () => {
    const result1 = buildPredicate({ predicate: unconditionalPredicate });
    const result2 = buildPredicate({ predicate: unconditionalPredicate });
    
    expect(result1.ok && result2.ok).toBe(true);
    if (!result1.ok || !result2.ok) return;
    
    expect(result1.value.xdrBase64).toBe(result2.value.xdrBase64);
  });
});
