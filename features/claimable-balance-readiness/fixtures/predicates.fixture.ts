import type { HorizonPredicate } from "@/features/claimable-balance-readiness/lib/predicate-tree";

/** Deterministic nested and leaf predicates for unit tests. */
export const unconditionalPredicate: HorizonPredicate = { unconditional: true };

export const emptyObjectPredicate: HorizonPredicate = {};

export const absBeforePredicate: HorizonPredicate = {
  abs_before: "2027-01-01T00:00:00Z",
  abs_before_epoch: "1798761600"
};

export const absAfterPredicate: HorizonPredicate = {
  abs_after: "2026-01-01T00:00:00Z",
  abs_after_epoch: "1767225600"
};

export const relBeforePredicate: HorizonPredicate = { rel_before: "86400" };

export const relAfterPredicate: HorizonPredicate = { rel_after: "3600" };

export const nestedOrAndNotPredicate: HorizonPredicate = {
  or: [
    {
      and: [
        { not: { abs_before: "2027-01-01T00:00:00Z", abs_before_epoch: "1798761600" } },
        { rel_before: "120" }
      ]
    },
    { abs_after: "2026-01-01T00:00:00Z", abs_after_epoch: "1767225600" }
  ]
};

export const unsupportedPredicate: HorizonPredicate = {
  and: []
} as HorizonPredicate;

export const andBothAbsPredicate: HorizonPredicate = {
  and: [
    { abs_after: "2026-01-01T00:00:00Z", abs_after_epoch: "1767225600" },
    { abs_before: "2027-01-01T00:00:00Z", abs_before_epoch: "1798761600" }
  ]
};
