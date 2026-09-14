import type { ClaimablePredicateBuilderResult } from "@/features/claimable-predicate-builder/types";

export const claimablePredicateBuilderFixture: ClaimablePredicateBuilderResult = {
  description: "can be claimed at any time",
  xdr: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
  timeline: [{ from: 0, to: null }],
  unsatisfiable: false
};
